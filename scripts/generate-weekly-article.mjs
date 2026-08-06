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
// "checklist" (Article.checklist) se ZAMERNE negeneruje - obsahova pravidla
// pro nej jsou nerozhodnuta, viz OTAZKY.md. Schema ho ma jako volitelny, takze
// jeho vynechani nic nerozbije.
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
} from "./generate-test-card.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ARTICLES_DIR = path.join(ROOT, "content", "articles");
const REPORTS_DIR = path.join(ROOT, "reports");
const MANIFEST_PATH = path.join(REPORTS_DIR, "weekly-article-manifest.json");
const LAST_PATH_FILE = path.join(REPORTS_DIR, "last-generated-article-path.txt");

const DEFAULT_TOPIC_COUNT = 5;
const TOPIC_COUNT = Number(process.env.WEEKLY_ARTICLE_TOPIC_COUNT) || DEFAULT_TOPIC_COUNT;

// --- vyber top N kandidatu (rozsireni Faze 3, ktera brala jen nejlepsi 1) ---
function selectTopCandidates(candidates, count) {
  const scored = candidates
    .map((c) => ({ candidate: c, ...scoreCandidate(c) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  const seenLinks = new Set();
  const picked = [];
  for (const s of scored) {
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

  const picked = selectTopCandidates(candidates, TOPIC_COUNT);
  if (picked.length === 0) {
    console.error(
      "Zadna polozka tento tyden neobsahuje zadne z klicovych slov relevance (viz KEYWORDS v generate-test-card.mjs) - " +
        "neni co publikovat. Zastavuji se bez generovani (radeji nic nez irelevantni obsah)."
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

  console.log(`\nSestavuji title/lead z ${topics.length} vygenerovanych temat...`);
  const envelope = await generateLead(client, topics);

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

main().catch((err) => {
  console.error("Neocekavana chyba behu skriptu:", err);
  process.exitCode = 1;
});
