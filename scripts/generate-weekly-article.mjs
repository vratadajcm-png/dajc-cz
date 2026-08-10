#!/usr/bin/env node
// Faze 5 - generovani celeho tydenniho clanku (vice temat + title/dateRange/lead)
// z RSS/Atom zdroju pres Claude API pro automatizovany GitHub Actions workflow.
//
// Znovupouziva stavebni bloky z Faze 2 (scripts/read-feeds.mjs) a Faze 3
// (scripts/generate-test-card.mjs) - stejnou heuristiku relevance, stejny
// system prompt a JSON schema pro jednotlive tema, stejnou disciplinu "zadna
// fakta mimo dodana data". Rozdil oproti Fazi 3: misto jedne nejlepsi polozky
// vybira top N kandidatu a navic sestavuje obalku clanku (title/dateRange/lead).
//
// Vystup:
//   content/articles/<ISO-datum>-tydenni-prehled.json  - hotovy clanek
//   reports/weekly-article-manifest.json                - puvodni RSS polozky
//                                                          pouzite pro kazde
//                                                          tema (pro krizovou
//                                                          kontrolu ve
//                                                          validate-article.mjs)
//   reports/last-generated-article-path.txt              - relativni cesta k
//                                                          vygenerovanemu
//                                                          clanku (pro predani
//                                                          mezi kroky GH Actions)

import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import {
  loadEnvLocal,
  scoreCandidate,
  collectAllOkItems,
  MODEL,
  generateCard,
  sanityCheck,
  normalize,
} from "./generate-test-card.mjs";
import { MAX_AGE_DAYS, computeAgeDays } from "./validate-article.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ARTICLES_DIR = path.join(ROOT, "content", "articles");
const REPORTS_DIR = path.join(ROOT, "reports");
const MANIFEST_PATH = path.join(REPORTS_DIR, "weekly-article-manifest.json");
const LAST_PATH_FILE = path.join(REPORTS_DIR, "last-generated-article-path.txt");

// Strop, ne pevny pocet - stavajici logika uz umi vratit min, kdyz neni z
// ceho vybirat (viz "picked.length" nize), takze skutecny pocet temat v
// clanku je 0..20 podle dostupnosti cerstvych/validnich kandidatu, bez
// umeleho doplnovani.
const DEFAULT_TOPIC_COUNT = 20;
const TOPIC_COUNT = Number(process.env.WEEKLY_ARTICLE_TOPIC_COUNT) || DEFAULT_TOPIC_COUNT;

// --- freshness filtr (Faze 5.1) ---------------------------------------------
// Vyrazuje kandidaty starsi nez MAX_AGE_DAYS (nebo bez pouzitelneho pubDate)
// JESTE PRED scoringem/vyberem - ne az po vygenerovani karty pres API. Duvod:
// scoreCandidate hodnoti jen shodu klicovych slov, takze pomalu publikujici
// zdroj (napr. cz-czechtoll) muze vyhrat vyber i kdyz je stary tydny, a bez
// tohoto filtru by se to odhalilo az v validate-article.mjs - po zbytecnem
// API volani a se selhanim celeho patecniho behu.
//
// Bezstavove: vyhodnocuje pubDate kazdeho kandidata znovu pri kazdem behu
// (candidates prichazi cerstve z collectAllOkItems() vola RSS zive) - zadna
// "pamet" mezi behy, zadne trvale blacklistovani zdroje. Pokud stejny zdroj
// pristi tyden publikuje cerstvy clanek, projde bez problemu.
//
// MAX_AGE_DAYS je importovan z validate-article.mjs (ne duplikovan) - jeden
// prah pro vyber i pro blokujici validaci, aby se casem nerozjely.
export function isFreshEnough(candidate, maxAgeDays) {
  const ageDays = computeAgeDays(candidate.pubDate);
  return ageDays !== null && ageDays <= maxAgeDays;
}

// --- deduplikace kandidatu se stejnou faktickou zpravou --------------------
// Bezi PRED scoringem/vyberem (na freshCandidates), aby dve verze te same
// zpravy nikdy neobsadily dva sloty z pozadovaneho poctu temat najednou.
// Motivovano realnym pripadem: cz-czechtoll publikuje tutez zpravu o mytnem
// zvlast v cestine a zvlast v anglictine (dva ruzne odkazy/dva ruzne clanky
// ve feedu) - proste porovnani URL zdroje to neodhali.
//
// Porovnava se jen uvnitr stejne zeme (candidate.country). Pouzivaji se dva
// nezavisle signaly podobnosti, protoze duplicity mohou byt i mezijazykove:
//  - slovni prekryv (Jaccard) na normalizovanem titulku - chyti duplicity ve
//    stejnem jazyce,
//  - cislovy fingerprint (castky, procenta) z titulku+snippetu - chyti i
//    mezijazykove duplicity, kde slovni podobnost selze, ale fakta (cisla)
//    jsou identicka.
const TITLE_JACCARD_THRESHOLD = 0.5;
const NUMBER_JACCARD_THRESHOLD = 0.6;
const MIN_SHARED_NUMBERS = 2;

function titleWordSet(text) {
  // \p{L}\p{N} (Unicode-aware, ne jen a-z0-9) - zdroje obsahuji i cyrilici
  // (by-belavtodor) a dalsi ne-latinkove znaky, ktere by jinak regex smazal
  // beze zbytku a vsechny takove titulky by kolabovaly na stejnou (prazdnou
  // nebo jen ciselnou) mnozinu token - viz test s "Транспортный вестник...".
  return new Set(
    normalize(text)
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4)
  );
}

// Hole letopocty (1900-2099) se z fingerprintu vyrazuji - realny pripad:
// periodicky bulletin (by-belavtodor "Транспортный вестник <datum>: ...")
// ma datum vydani v kazdem titulku, takze ruzne polozky ze stejneho dne
// sdilely tokeny "23.07"+"2026" a falesne se oznacily jako duplicita, i kdyz
// slo o 4 ruzne zpravy. Rok sam o sobe nese skoro nulovou informaci o tom,
// jestli jde o stejnou udalost - penezni castky/procenta/pocty ano.
function isLikelyBareYear(token) {
  return /^(19|20)\d{2}$/.test(token);
}

function numberSet(text) {
  const matches = normalize(text).match(/\d+(?:[.,]\d+)?/g) || [];
  return new Set(
    matches
      .map((n) => n.replace(",", "."))
      .filter((n) => Number(n) >= 2 && !isLikelyBareYear(n)) // drobna cisla (1, "1." apod.) jsou moc casty sum
  );
}

function jaccard(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const x of setA) if (setB.has(x)) intersection++;
  return intersection / (setA.size + setB.size - intersection);
}

function isDuplicateCandidate(a, b) {
  const titleSim = jaccard(titleWordSet(a.title), titleWordSet(b.title));
  if (titleSim >= TITLE_JACCARD_THRESHOLD) return true;

  const numsA = numberSet(`${a.title} ${a.contentSnippet || ""}`);
  const numsB = numberSet(`${b.title} ${b.contentSnippet || ""}`);
  let sharedCount = 0;
  for (const n of numsA) if (numsB.has(n)) sharedCount++;
  return sharedCount >= MIN_SHARED_NUMBERS && jaccard(numsA, numsB) >= NUMBER_JACCARD_THRESHOLD;
}

// Shlukovani je "single-linkage" (any-match): kandidat patri do prvniho
// shluku, kde je duplicitni s KTERYMKOLIV jiz zarazenym clenem, ne jen s
// prvnim. Z kazdeho shluku > 1 se ponecha jen jeden reprezentant - s
// nejvyssim relevance skore, pri shode delsi snippet, pak drivejsi pubDate.
export function deduplicateCandidates(candidates) {
  const byCountry = new Map();
  for (const c of candidates) {
    const list = byCountry.get(c.country) || [];
    list.push(c);
    byCountry.set(c.country, list);
  }

  const kept = [];
  const dropped = [];
  for (const group of byCountry.values()) {
    const clusters = [];
    for (const candidate of group) {
      const cluster = clusters.find((cl) =>
        cl.some((existing) => isDuplicateCandidate(existing, candidate))
      );
      if (cluster) {
        cluster.push(candidate);
      } else {
        clusters.push([candidate]);
      }
    }

    for (const cluster of clusters) {
      if (cluster.length === 1) {
        kept.push(cluster[0]);
        continue;
      }
      const ranked = cluster
        .map((c) => ({
          candidate: c,
          score: scoreCandidate(c).score,
          snippetLen: (c.contentSnippet || "").length,
        }))
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          if (b.snippetLen !== a.snippetLen) return b.snippetLen - a.snippetLen;
          return (a.candidate.pubDate || "").localeCompare(b.candidate.pubDate || "");
        });
      kept.push(ranked[0].candidate);
      for (const r of ranked.slice(1)) dropped.push(r.candidate);
    }
  }

  if (dropped.length > 0) {
    console.log(`Deduplikace: odstraneno ${dropped.length} duplicitnich kandidatu (stejna zprava, jiny zdroj/jazyk):`);
    for (const d of dropped) {
      console.log(`  [${d.sourceId}, ${d.country}] "${d.title}"`);
    }
  }

  // zachovat puvodni poradi vstupu, at je vystup deterministicky pro dalsi kroky
  const keptSet = new Set(kept);
  return candidates.filter((c) => keptSet.has(c));
}

// --- geograficka priorita ("sirsi stredni Evropa") -------------------------
// Tvrde pravidlo, ne preference: KAZDY kandidat z CORE_COUNTRIES se v poradi
// umisti pred KAZDYM kandidatem mimo tuto skupinu, bez ohledu na relevance
// skore. Uvnitr kazde skupiny se stale radi podle skore jako driv. Pokud
// zadny core kandidat neexistuje, chovani je shodne se stavajicim (jen
// razeni podle skore).
export const CORE_COUNTRIES = ["CZ", "SK", "PL", "AT", "DE", "HU"];

// --- vyber top N kandidatu (rozsireni Faze 3, ktera brala jen nejlepsi 1) ---
export function selectTopCandidates(candidates, count) {
  const scored = candidates
    .map((c) => ({ candidate: c, ...scoreCandidate(c) }))
    .filter((s) => s.score > 0);

  const core = scored
    .filter((s) => CORE_COUNTRIES.includes(s.candidate.country))
    .sort((a, b) => b.score - a.score);
  const rest = scored
    .filter((s) => !CORE_COUNTRIES.includes(s.candidate.country))
    .sort((a, b) => b.score - a.score);
  const ordered = [...core, ...rest];

  const seenLinks = new Set();
  const picked = [];
  for (const s of ordered) {
    if (!s.candidate.link || seenLinks.has(s.candidate.link)) continue;
    seenLinks.add(s.candidate.link);
    picked.push(s);
    if (picked.length >= count) break;
  }
  return picked;
}

// --- CZ formatovani rozsahu tydne (pondeli-nedele obsahujici "today") ------
const CZ_MONTHS_GENITIVE = [
  "ledna", "unora", "brezna", "dubna", "kvetna", "cervna",
  "cervence", "srpna", "zari", "rijna", "listopadu", "prosince",
];

function mondayOfWeek(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay(); // 0 = nedele
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diffToMonday);
  return d;
}

function formatDateRange(today) {
  const monday = mondayOfWeek(today);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  const dayM = monday.getUTCDate();
  const dayS = sunday.getUTCDate();
  const monthS = CZ_MONTHS_GENITIVE[sunday.getUTCMonth()];
  const year = sunday.getUTCFullYear();

  if (monday.getUTCMonth() === sunday.getUTCMonth()) {
    return `${dayM}.–${dayS}. ${monthS} ${year}`;
  }
  const monthM = CZ_MONTHS_GENITIVE[monday.getUTCMonth()];
  return `${dayM}. ${monthM} – ${dayS}. ${monthS} ${year}`;
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

// --- druhy Claude call: sestaveni title/lead z jiz vygenerovanych temat ----
// Nova logika (Faze 3 tohle nedelala - resila jen jednu kartu, ne obalku
// clanku), ale se stejnou disciplinou: jen shrnovat dodana temata, nic
// nedoplnovat.
const LEAD_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "Kratky, vecny nadpis tydenniho prehledu v cestine" },
    lead: { type: "string", description: "2-4 vety uvodniho shrnuti tydne, jen na zaklade dodanych temat" },
  },
  required: ["title", "lead"],
  additionalProperties: false,
};

const LEAD_SYSTEM_PROMPT = `Jsi editor tydenniho prehledu pro web dajc.cz (oversize cargo preprava). Dostanes seznam jiz vytvorenych temat (country/title/body) tohoto tydne a vytvoris k nim nadpis a uvodni odstavec (lead) podle presneho JSON schematu.

KRITICKA PRAVIDLA:
- Pis v cestine.
- "title" a "lead" smi shrnovat JEN to, co je obsazeno v dodanych tematech. Nic nedoplnuj, nevymyslej statistiky, trendy ani kontext, ktery neni v tematech primo dany.
- "lead" je obecne uvedeni do tydne (2-4 vety) - nemusi vyjmenovat kazde tema zvlast, ale nesmi tvrdit nic, co temata neobsahuji.
- Nezminuj konkretni cisla/data, pokud nejsou doslova v dodanych tematech.`;

// --- treti Claude call: checklist odvozeny z CELEHO obsahu clanku ----------
// Na rozdil od generateLead (title/lead) tady jde o akcni to-do polozky, ne
// shrnuti - viz OTAZKY.md pro rozhodnuti a system prompt nize pro presna
// kriteria. AI dostava stejna jiz vygenerovana temata jako generateLead
// (dedi jejich grounding), ne syrova RSS data.
const CHECKLIST_SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string", description: "Jedna akcni pripominka/to-do v cestine" },
          topicIndices: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
            description: "0-based indexy do dodaneho pole temat, ze kterych tato polozka vychazi",
          },
        },
        required: ["text", "topicIndices"],
        additionalProperties: false,
      },
    },
  },
  required: ["items"],
  additionalProperties: false,
};

const CHECKLIST_SYSTEM_PROMPT = `Jsi editor tydenniho prehledu pro web dajc.cz (oversize cargo preprava). Dostanes seznam jiz vytvorenych temat (country/title/body/impact/validity) tohoto tydne a z nich sestavis checklist akcnich pripominek podle presneho JSON schematu.

KRITICKA PRAVIDLA:
- Pis v cestine, akcni formulace ("Od pondeli plati...", "Zkontrolujte...") - NE prepis titulku tematu.
- Kazda polozka smi vzniknout JEN parafrazi toho, co je doslova v body/impact/validity NEKTEREHO z dodanych temat. Zadne nove skutecnosti, cisla ani data, ktera tam nejsou.
- "topicIndices" musi presne uvadet 0-based index/indexy tematu v dodanem poli, ze kterych polozka vychazi - nikdy nesmi byt prazdne.
- Zadna syntaza napric tematy: polozka nesmi kombinovat dve temata do tvrzeni, ktere zadne z nich samostatne nerika. Pokud polozka cituje vice indexu, kazdy z nich musi tvrzeni samostatne podporovat.
- Tema bez konkretni odvoditelne akce proste preskoc - checklist neni 1:1 seznam temat, jen vyber toho, co vyzaduje akci.
- Maximalne 6 polozek.
- Pokud zadne tema neobsahuje nic akcniho, vrat prazdne pole "items" - to je v poradku.`;

async function generateChecklist(client, topics) {
  const payload = topics.map((t) => ({ country: t.country, title: t.title, body: t.body, impact: t.impact, validity: t.validity }));
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    // Sonnet 5 vychozi na adaptivni thinking i kdyz "thinking" neni zadan a
    // max_tokens je spolecny strop pro thinking+odpoved - u jednoducheho
    // vytahovani frazi z dodanych dat neni thinking potreba a jen orizne
    // JSON (stop_reason: max_tokens). Vypnuto zamerne.
    thinking: { type: "disabled" },
    system: CHECKLIST_SYSTEM_PROMPT,
    output_config: {
      format: { type: "json_schema", schema: CHECKLIST_SCHEMA },
    },
    messages: [
      {
        role: "user",
        content:
          "Zde jsou temata tohoto tydenniho prehledu. Sestav z nich checklist podle schematu a instrukci v system promptu:\n\n" +
          JSON.stringify(payload, null, 2),
      },
    ],
  });
  if (response.stop_reason === "refusal") {
    throw new Error("Claude API odmitlo sestavit checklist (stop_reason: refusal).");
  }
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock) {
    throw new Error("Odpoved na checklist neobsahuje zadny text blok.");
  }
  return JSON.parse(textBlock.text);
}

// Overi, ze topicIndices kazde polozky odkazuji na existujici temata, a
// vrati jen text validnich polozek. Nevalidni polozky se zahodi s varovanim
// do konzole (stejny nekekajici vzor jako sanityCheck v generate-test-card.mjs)
// - checklist je volitelne pole, takze zahozeni jedne polozky neni fatalni.
export function extractValidChecklistItems(checklistResult, topicsLength) {
  const validTexts = [];
  const items = checklistResult?.items || [];
  for (const item of items) {
    const indices = item.topicIndices || [];
    const allValid =
      indices.length > 0 &&
      indices.every((i) => Number.isInteger(i) && i >= 0 && i < topicsLength);
    if (!allValid) {
      console.log(
        `  POZOR - checklist polozka "${item.text}" ma neplatne topicIndices (${JSON.stringify(item.topicIndices)}) - zahazuji.`
      );
      continue;
    }
    validTexts.push(item.text);
  }
  return validTexts;
}

async function generateLead(client, topics) {
  const payload = topics.map((t) => ({ country: t.country, title: t.title, body: t.body }));
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: LEAD_SYSTEM_PROMPT,
    output_config: {
      format: { type: "json_schema", schema: LEAD_SCHEMA },
    },
    messages: [
      {
        role: "user",
        content:
          "Zde jsou temata tohoto tydenniho prehledu. Vytvor k nim title a lead podle schematu a instrukci v system promptu:\n\n" +
          JSON.stringify(payload, null, 2),
      },
    ],
  });
  if (response.stop_reason === "refusal") {
    throw new Error("Claude API odmitlo sestavit title/lead (stop_reason: refusal).");
  }
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock) {
    throw new Error("Odpoved na title/lead neobsahuje zadny text blok.");
  }
  return JSON.parse(textBlock.text);
}

async function main() {
  // .env.local je jen pro lokalni vyvoj - v GitHub Actions soubor neexistuje
  // a ANTHROPIC_API_KEY prijde jako realna env promenna ze secretu. Na rozdil
  // od generate-test-card.mjs proto NEPOVAZUJEME chybejici .env.local samo o
  // sobe za chybu - kontroluje se jen vysledny stav promenne prostredi.
  await loadEnvLocal();
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY neni nastaveny (ani v .env.local, ani v prostredi). Zastavuji se.");
    process.exitCode = 1;
    return;
  }

  const candidates = await collectAllOkItems();
  if (candidates.length === 0) {
    console.error("Zadny zdroj se uspesne nenacetl - neni z ceho vybirat. Zastavuji se.");
    process.exitCode = 1;
    return;
  }

  const freshCandidates = candidates.filter((c) => isFreshEnough(c, MAX_AGE_DAYS));
  const staleDropped = candidates.length - freshCandidates.length;
  if (staleDropped > 0) {
    console.log(
      `Vyrazeno ${staleDropped} kandidatu jako prilis starych nebo bez pouzitelneho pubDate (limit ${MAX_AGE_DAYS} dni) - nebudou zvazovani pro vyber.`
    );
  }

  const dedupedCandidates = deduplicateCandidates(freshCandidates);

  const picked = selectTopCandidates(dedupedCandidates, TOPIC_COUNT);
  if (picked.length === 0) {
    console.error(
      "Zadna cerstva polozka tento tyden neobsahuje zadne z klicovych slov relevance (viz KEYWORDS v generate-test-card.mjs) - " +
        "neni co publikovat. Zastavuji se bez generovani (radeji nic nez zastaraly/irelevantni obsah)."
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Vybrano ${picked.length}/${TOPIC_COUNT} pozadovanych temat:`);
  for (const s of picked) {
    console.log(`  [${s.score}] (${s.candidate.sourceId}, ${s.candidate.country}) "${s.candidate.title}"`);
  }

  const client = new Anthropic();

  console.log(`\nGeneruji ${picked.length} temat pres Claude API (model: ${MODEL})...`);
  const topics = [];
  const manifest = [];
  let sanityWarningCount = 0;
  for (const s of picked) {
    const item = s.candidate;
    const response = await generateCard(client, item);
    if (response.stop_reason === "refusal") {
      console.error(`  [${item.sourceId}] Claude API odmitlo pozadavek (stop_reason: refusal) - preskakuji tuto polozku.`);
      continue;
    }
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock) {
      console.error(`  [${item.sourceId}] odpoved neobsahuje text blok - preskakuji tuto polozku.`);
      continue;
    }
    const card = JSON.parse(textBlock.text);
    const problems = sanityCheck(card, item);
    if (problems.length > 0) {
      sanityWarningCount += 1;
      console.log(`  [${item.sourceId}] POZOR - sanity check nasel ${problems.length} problem(y):`);
      for (const p of problems) console.log(`    - ${p}`);
    } else {
      console.log(`  [${item.sourceId}] OK`);
    }
    topics.push(card);
    manifest.push({
      sourceId: item.sourceId,
      sourceName: item.sourceName,
      country: item.country,
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
    });
  }

  if (topics.length === 0) {
    console.error("\nZadne tema se uspesne nevygenerovalo - neni z ceho sestavit clanek. Zastavuji se.");
    process.exitCode = 1;
    return;
  }

  console.log(`\nSestavuji title/lead a checklist z ${topics.length} vygenerovanych temat...`);
  const [envelope, checklistResult] = await Promise.all([
    generateLead(client, topics),
    generateChecklist(client, topics),
  ]);
  const checklist = extractValidChecklistItems(checklistResult, topics.length);
  console.log(
    checklist.length > 0
      ? `Checklist: ${checklist.length} polozek.`
      : `Checklist: zadne tema neneslo konkretni akci, pole se vynecha.`
  );

  const today = new Date();
  const dateRange = formatDateRange(today);
  const dateStr = isoDate(today);
  const slug = `${dateStr}-tydenni-prehled`;

  const article = {
    slug,
    title: envelope.title,
    dateRange,
    lead: envelope.lead,
    topics,
    ...(checklist.length > 0 ? { checklist } : {}),
    draft: false,
  };

  await mkdir(ARTICLES_DIR, { recursive: true });
  const articlePath = path.join(ARTICLES_DIR, `${slug}.json`);
  await writeFile(articlePath, JSON.stringify(article, null, 2) + "\n", "utf-8");

  await mkdir(REPORTS_DIR, { recursive: true });
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf-8");

  const relativeArticlePath = path.relative(ROOT, articlePath).replace(/\\/g, "/");
  await writeFile(LAST_PATH_FILE, relativeArticlePath, "utf-8");

  console.log(`\nClanek zapsan do ${relativeArticlePath}`);
  console.log(`Manifest (pro krizovou kontrolu zdroju) zapsan do ${path.relative(ROOT, MANIFEST_PATH)}`);
  if (sanityWarningCount > 0) {
    console.log(
      `\nPOZOR: ${sanityWarningCount} tema(t) melo sanity-check varovani - validate-article.mjs je vyhodnoti jako blokujici chybu.`
    );
  }
}

// Spustit main() jen pri primem `node scripts/generate-weekly-article.mjs` -
// ne pri importu isFreshEnough/selectTopCandidates (napr. pro test). Stejny
// vzorec jako v generate-test-card.mjs / validate-article.mjs.
const isDirectRun = path.resolve(process.argv[1] || "") === path.resolve(__dirname, "generate-weekly-article.mjs");
if (isDirectRun) {
  main().catch((err) => {
    console.error("Neocekavana chyba behu skriptu:", err);
    process.exitCode = 1;
  });
}
