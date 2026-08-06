#!/usr/bin/env node
// Faze 3 - testovaci generovani JEDNE karty z JEDNE skutecne RSS polozky pomoci
// Claude API. Negeneruje cely tydenni clanek, negeneruje GitHub Actions, nic
// neuklada do content/articles/. Cilem je overit jen jeden krok converze
// realna-polozka -> jedna karta podle schvaleneho vizualu.

import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { loadRegistry, makeParser, processSource } from "./read-feeds.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ENV_LOCAL_PATH = path.join(ROOT, ".env.local");
const OUTPUT_PATH = path.join(ROOT, "reports", "test-card-output.json");

export const MODEL = "claude-sonnet-5";

// --- .env.local (minimalisticky parser, zadna dalsi zavislost) ---------
export async function loadEnvLocal() {
  let raw;
  try {
    raw = await readFile(ENV_LOCAL_PATH, "utf-8");
  } catch {
    return false; // soubor neexistuje
  }
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
  return true;
}

// --- Heuristika relevance pro oversize cargo tema -----------------------
// Zamerne jednoducha a jen pro latinku - vetsina zdroju v registru pise
// latinkou (CZ/SK/PL/DE/EN/FR/RO/SQ/LT/...), Cyrilice/rectina timhle
// neprojde a skore 0 - u takoveho zdroje se pak vybira jen jako fallback.
export const KEYWORDS = [
  // vysoka relevance - primo nadmerna/specialni preprava
  { w: 5, kw: "nadmern" },
  { w: 5, kw: "nadrozmer" },
  { w: 5, kw: "oversize" },
  { w: 5, kw: "abnormal load" },
  { w: 5, kw: "special transport" },
  { w: 5, kw: "heavy transport" },
  { w: 5, kw: "wide load" },
  { w: 5, kw: "escort vehicle" },
  { w: 5, kw: "convoi exceptionnel" },
  { w: 5, kw: "transport special" },
  // stredni relevance - myto/mosty/tunely/uzavirky/vystavba
  { w: 3, kw: "myto" },
  { w: 3, kw: "mytn" },
  { w: 3, kw: "toll" },
  { w: 3, kw: "tunel" },
  { w: 3, kw: "tunnel" },
  { w: 3, kw: "most " },
  { w: 3, kw: "bridge" },
  { w: 3, kw: "hmotnostni limit" },
  { w: 3, kw: "weight limit" },
  { w: 3, kw: "uzavirk" },
  { w: 3, kw: "closure" },
  { w: 3, kw: "restrict" },
  { w: 3, kw: "zakaz" },
  { w: 3, kw: "interdic" },
  { w: 3, kw: "roadworks" },
  { w: 3, kw: "vystavb" },
  { w: 3, kw: "rekonstrukc" },
  { w: 3, kw: "reconstruct" },
  { w: 3, kw: "oprav" },
  { w: 3, kw: "dialnic" },
  { w: 3, kw: "dalnic" },
  { w: 3, kw: "highway" },
  { w: 3, kw: "motorway" },
  // nizka relevance - obecne silnice/doprava
  { w: 1, kw: "silnic" },
  { w: 1, kw: "cesta" },
  { w: 1, kw: "road " },
  { w: 1, kw: "traffic" },
  { w: 1, kw: "doprav" },
];

export function normalize(text) {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function scoreCandidate(candidate) {
  const titleNorm = normalize(candidate.title);
  const snippetNorm = normalize(candidate.contentSnippet);
  let score = 0;
  const matched = [];
  for (const { w, kw } of KEYWORDS) {
    const kwNorm = normalize(kw);
    if (titleNorm.includes(kwNorm)) {
      score += w;
      matched.push(`${kw.trim()} (titulek, +${w})`);
    } else if (snippetNorm.includes(kwNorm)) {
      const half = Math.max(1, Math.round(w / 2));
      score += half;
      matched.push(`${kw.trim()} (obsah, +${half})`);
    }
  }
  return { score, matched };
}

export async function collectAllOkItems() {
  const registry = await loadRegistry();
  const feedSources = registry.sources.filter(
    (s) => s.type === "rss" || s.type === "atom"
  );
  const parser = makeParser();

  console.log(`Nacitam ${feedSources.length} rss/atom zdroju pro vyber kandidata...`);
  const candidates = [];
  for (const source of feedSources) {
    const result = await processSource(parser, source);
    if (result.status !== "ok") {
      console.log(`  [${source.id}] preskoceno (${result.status})`);
      continue;
    }
    console.log(`  [${source.id}] OK - ${result.itemCount} polozek`);
    for (const item of result.items) {
      candidates.push({
        sourceId: source.id,
        sourceName: source.name,
        country: source.country,
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        contentSnippet: item.contentSnippet,
      });
    }
  }
  return candidates;
}

function selectBestCandidate(candidates) {
  const scored = candidates
    .map((c) => ({ candidate: c, ...scoreCandidate(c) }))
    .sort((a, b) => b.score - a.score);

  console.log("\nTop kandidati podle relevance pro oversize cargo tema:");
  for (const s of scored.slice(0, 5)) {
    console.log(
      `  [${s.score}] (${s.candidate.sourceId}) "${s.candidate.title}"` +
        (s.matched.length ? `\n        shoda: ${s.matched.join(", ")}` : "\n        shoda: zadna (0)")
    );
  }

  const best = scored[0];
  const reason =
    best.score > 0
      ? `Nejvyssi skore relevance (${best.score}) diky shode klicovych slov: ${best.matched.join(", ")}.`
      : `Zadna polozka neobsahuje zadne z hledanych klicovych slov (heuristika pokryva hlavne latinku) - vybrana prvni dostupna polozka jako fallback.`;

  return { selected: best.candidate, score: best.score, matched: best.matched, reason, scoredTop5: scored.slice(0, 5) };
}

// --- Claude ----------------------------------------------------------------

export const CARD_SCHEMA = {
  type: "object",
  properties: {
    country: { type: "string", description: "Kod zeme zdroje, presne jak byl dodan" },
    title: { type: "string", description: "Kratky, vecny nadpis karty v cestine" },
    body: { type: "string", description: "2-3 vety shrnuti, jen na zaklade dodaneho titulku/obsahu" },
    impact: { type: "string", description: "Dopad na prepravu - 1-2 vety, vynechat pokud neni dost informaci" },
    validity: { type: "string", description: "Datum platnosti/ucinnosti - jen pokud je explicitne v dodane polozce, jinak vynechat" },
    source: {
      type: "object",
      properties: {
        name: { type: "string" },
        url: { type: "string" },
      },
      required: ["name", "url"],
      additionalProperties: false,
    },
  },
  required: ["country", "title", "body", "source"],
  additionalProperties: false,
};

export const SYSTEM_PROMPT = `Jsi editor zpravodajske karty pro web dajc.cz (oversize cargo preprava). Z JEDNE dodane RSS polozky vytvoris JEDNU kartu podle presneho JSON schematu.

KRITICKA PRAVIDLA:
- Vsechen text (title, body, impact) pis v cestine, i kdyz je zdrojova polozka v jinem jazyce.
- "body" smi obsahovat JEN fakta, ktera jsou doslova pritomna v dodanem titulku nebo obsahu polozky. Nic nedoplnuj, nic si nedomyslej, neodhaduj kontext, ktery neni dan.
- "impact" (dopad na prepravu) vyplnuj JEN pokud z dodanych dat jde rozumne odvodit prakticky dopad pro ridice/dispecera. Pokud dodana polozka neobsahuje dost informaci, pole "impact" v odpovedi UPLNE VYNECH - nevymyslej si obecnou frazi.
- "validity" (datum platnosti/ucinnosti predpisu) vyplnuj JEN pokud polozka explicitne uvadi datum platnosti/ucinnosti/od-do. Datum publikace clanku (pubDate) NENI totez co platnost predpisu - nezamenuj je. Pokud zadne explicitni datum platnosti v datech neni, pole "validity" UPLNE VYNECH.
- "source.name" a "source.url" musi byt PRESNE totozne s hodnotami, ktere ti byly dodany - zadna uprava, zkraceni, "vycisteni" URL ani prekladani nazvu zdroje.
- "country" opis presne tak, jak byl dodan.
- Nevymysli zadne udalosti, cisla, data ani jmena, ktera v dodane polozce nejsou.`;

export async function generateCard(client, item) {
  const userPayload = {
    country: item.country,
    title: item.title,
    link: item.link,
    pubDate: item.pubDate,
    contentSnippet: item.contentSnippet,
    source_name: item.sourceName,
  };

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    output_config: {
      format: { type: "json_schema", schema: CARD_SCHEMA },
    },
    messages: [
      {
        role: "user",
        content:
          "Zde je jedna polozka z RSS feedu. Vytvor z ni jednu kartu podle schematu a instrukci v system promptu:\n\n" +
          JSON.stringify(userPayload, null, 2),
      },
    ],
  });

  return response;
}

export function sanityCheck(card, item) {
  const problems = [];

  if (card.source?.url !== item.link) {
    problems.push(
      `source.url ("${card.source?.url}") se PRESNE neshoduje s puvodnim link ("${item.link}") - AI mohla URL upravit.`
    );
  }
  if (card.source?.name !== item.sourceName) {
    problems.push(
      `source.name ("${card.source?.name}") se PRESNE neshoduje s nazvem zdroje v registru ("${item.sourceName}").`
    );
  }
  if (card.validity) {
    const haystack = normalize(`${item.title} ${item.contentSnippet || ""}`);
    const hasDateHint = /\d{1,2}[.\/]\d{1,2}[.\/]?\d{0,4}|\d{4}|leden|unor|brezen|duben|kveten|cerven|cervenec|srpen|zari|rijen|listopad|prosinec|january|february|march|april|may|june|july|august|september|october|november|december|od \d|do \d|platnost|ucinnost/i.test(
      haystack
    );
    if (!hasDateHint) {
      problems.push(
        `validity ("${card.validity}") byla vyplnena, ale v puvodnim titulku/obsahu se nenasel zadny zjevny datovy udaj - moznost, ze si AI datum domyslela.`
      );
    }
  }

  return problems;
}

async function main() {
  const hadEnvFile = await loadEnvLocal();
  if (!hadEnvFile) {
    console.error(".env.local nenalezen v " + ENV_LOCAL_PATH);
    process.exitCode = 1;
    return;
  }
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

  const selection = selectBestCandidate(candidates);
  const item = selection.selected;
  console.log(`\nVybrana polozka: [${item.sourceId}] "${item.title}"`);
  console.log(`Duvod vyberu: ${selection.reason}`);

  const client = new Anthropic();

  console.log(`\nVolam Claude API (model: ${MODEL})...`);
  const response = await generateCard(client, item);

  if (response.stop_reason === "refusal") {
    console.error("Claude API odmitlo pozadavek (stop_reason: refusal).");
    console.error(JSON.stringify(response.stop_details, null, 2));
    process.exitCode = 1;
    return;
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock) {
    console.error("Odpoved neobsahuje zadny text blok. Cela odpoved:");
    console.error(JSON.stringify(response, null, 2));
    process.exitCode = 1;
    return;
  }

  const card = JSON.parse(textBlock.text);
  const problems = sanityCheck(card, item);

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  const output = {
    generated_at: new Date().toISOString(),
    model: MODEL,
    selection: {
      reason: selection.reason,
      score: selection.score,
      matchedKeywords: selection.matched,
      top5: selection.scoredTop5.map((s) => ({
        sourceId: s.candidate.sourceId,
        title: s.candidate.title,
        score: s.score,
        matched: s.matched,
      })),
    },
    sourceItem: item,
    claude: {
      stop_reason: response.stop_reason,
      usage: response.usage,
    },
    card,
    sanityCheckProblems: problems,
  };
  await writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf-8");

  console.log("\n=== VYGENEROVANA KARTA ===");
  console.log(JSON.stringify(card, null, 2));

  console.log("\n=== PUVODNI RSS POLOZKA (pro srovnani) ===");
  console.log(JSON.stringify(item, null, 2));

  if (problems.length > 0) {
    console.log("\n=== PROBLEMY NALEZENE PRI KONTROLE (nemaskovano) ===");
    for (const p of problems) console.log(`  - ${p}`);
  } else {
    console.log("\nKontrola shody source.url/source.name a naznaku data pro 'validity' proslo bez namitek.");
  }

  console.log(`\nUlozeno do ${path.relative(ROOT, OUTPUT_PATH)}`);
}

// Spustit main() jen pri primem `node scripts/generate-test-card.mjs` - ne pri
// importu exportovanych funkci/konstant z generate-weekly-article.mjs (Faze 5),
// ktery je znovupouziva. Stejny vzorec jako v read-feeds.mjs (Faze 2).
const isDirectRun = path.resolve(process.argv[1] || "") === path.resolve(__dirname, "generate-test-card.mjs");
if (isDirectRun) {
  main().catch((err) => {
    console.error("Neocekavana chyba behu skriptu:", err);
    process.exitCode = 1;
  });
}
