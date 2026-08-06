#!/usr/bin/env node
// Faze 5 - blokujici validace vygenerovaneho tydenniho clanku PRED commitem.
//
// Rozsiruje inline (nekekajici, jen do konzole vypisujici) sanityCheck z Faze 3
// (generate-test-card.mjs) na povinnou branu: pri jakemkoli problemu skonci s
// process.exitCode = 1, pouziti ve workflow pak samo o sobe zastavi dalsi
// kroky (commit/push se neprovedou).
//
// Pouziti:
//   node scripts/validate-article.mjs <cesta-k-clanku.json> [cesta-k-manifestu.json]
//
// Prah stari zdrojove polozky (viz validateFreshness nize) je konfigurovatelny
// pres WEEKLY_ARTICLE_MAX_AGE_DAYS (stejny vzorec jako WEEKLY_ARTICLE_TOPIC_COUNT
// v generate-weekly-article.mjs), vychozi 30 dni.
//
// POZOR na hranice teto validace: mechanicky lze overit jen strukturu (povinna
// pole nejsou prazdna), integritu zdroje (source.url/source.name souhlasi s
// polozkou, ze ktere tema vzniklo), stari puvodni polozky (pubDate z RSS neni
// starsi nez prah) a hruby textovy signal stareho obsahu (rok v title/body
// vice nez 2 roky za aktualnim rokem). Semanticke "nejsou tam vymyslena
// fakta" se stoprocentne skriptem overit neda - o to se stara pisny system
// prompt v generate-test-card.mjs / generate-weekly-article.mjs uz pri
// generovani. Tento skript je mechanicky backstop, ne nahrada za to.
//
// Nepouziva zadny API klic ani jina citliva data - jen cte lokalni JSON soubory.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_MAX_AGE_DAYS = 30;
// Exportovano - generate-weekly-article.mjs pouziva stejny prah uz pri vyberu
// kandidatu (pred generovanim karty pres API), aby nevybiral kandidaty, ktere
// by tady stejne spadly na freshness kontrole. Jeden zdroj pravdy, aby se
// prahy postupem casu nerozjely.
export const MAX_AGE_DAYS = Number(process.env.WEEKLY_ARTICLE_MAX_AGE_DAYS) || DEFAULT_MAX_AGE_DAYS;

// Pocet let, o ktere smi zminovany rok v textu maximalne zaostavat za
// aktualnim rokem, nez je oznacen za mozne zastaraly obsah. Napevno 2 (ne
// konfigurovatelne pres env) - viz validateNoStaleYears nize.
const MAX_YEAR_AGE_GAP = 2;

function fail(problems) {
  console.error(`VALIDACE SELHALA - nalezeno ${problems.length} problem(y):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exitCode = 1;
}

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

// Povinna pole vychazi z lib/types/article.ts (Article/ArticleTopic) - "lead",
// "impact", "validity" a "checklist" jsou tam explicitne volitelne (`?:`),
// proto se tady NEKONTROLUJI jako povinna.
function validateRequiredFields(article) {
  const problems = [];

  if (!isNonEmptyString(article.title)) problems.push(`"title" chybi nebo je prazdny.`);
  if (!isNonEmptyString(article.dateRange)) problems.push(`"dateRange" chybi nebo je prazdny.`);
  if (!Array.isArray(article.topics) || article.topics.length === 0) {
    problems.push(`"topics" chybi nebo je prazdne pole.`);
    return problems; // dal nema smysl kontrolovat jednotliva temata
  }

  article.topics.forEach((topic, i) => {
    const label = `topics[${i}]`;
    if (!isNonEmptyString(topic.country)) problems.push(`${label}.country chybi nebo je prazdny.`);
    if (!isNonEmptyString(topic.title)) problems.push(`${label}.title chybi nebo je prazdny.`);
    if (!isNonEmptyString(topic.body)) problems.push(`${label}.body chybi nebo je prazdny.`);
    if (!topic.source || typeof topic.source !== "object") {
      problems.push(`${label}.source chybi.`);
    } else {
      if (!isNonEmptyString(topic.source.name)) problems.push(`${label}.source.name chybi nebo je prazdny.`);
      if (!isNonEmptyString(topic.source.url)) problems.push(`${label}.source.url chybi nebo je prazdny.`);
    }
  });

  return problems;
}

// Krizova kontrola proti manifestu puvodnich RSS polozek (pokud je dodan) -
// overuje, ze AI pri generovani nezmenila/nevymyslela zdroj tematu. Manifest
// a topics vznikaji v generate-weekly-article.mjs ve stejnem cyklu, takze
// indexy odpovidaji 1:1.
function validateSourceIntegrity(article, manifest) {
  const problems = [];
  if (!manifest) return problems;

  if (manifest.length !== article.topics.length) {
    problems.push(
      `Manifest ma ${manifest.length} polozek, ale clanek ma ${article.topics.length} temat - neodpovidaji si poctem, krizovou kontrolu zdroju nelze spolehlive provest.`
    );
    return problems;
  }

  article.topics.forEach((topic, i) => {
    const src = manifest[i];
    if (!src) return;
    if (topic.source?.url !== src.link) {
      problems.push(
        `topics[${i}].source.url ("${topic.source?.url}") se neshoduje s puvodni polozkou ("${src.link}") - mozna zmenene/vymyslene AI.`
      );
    }
    if (topic.source?.name !== src.sourceName) {
      problems.push(
        `topics[${i}].source.name ("${topic.source?.name}") se neshoduje s nazvem zdroje v registru ("${src.sourceName}").`
      );
    }
  });

  return problems;
}

// Kontrola stari puvodni RSS/Atom polozky (z manifestu) - NEZAVISLA na
// validateSourceIntegrity, obe museji projit, aby validace uspela. Bez
// manifestu (volitelny parametr) se preskakuje stejne jako kontrola integrity
// zdroje - Article/ArticleTopic pubDate vubec neuklada, takze bez manifestu
// neni co overovat. Duvod pridani: RSS feed muze u stareho clanku vratit
// aktualni pubDate/updated (viz sk-nds - clanek o dialnicni znamce pro rok
// 2016 s pubDate 2026-08-06), takze pubDate samo o sobe neni spolehlivy filtr
// pri vyberu tematu (Faze 3 scoring), ale tady slouzi jako posledni blokujici
// pojistka pred publikaci.
// Vraci stari poskytnuteho pubDate ve dnech (zaokrouhleno dolu), nebo null,
// pokud je pubDate prazdny/nenaparsovatelny. Exportovano - stejnou funkci
// pouziva generate-weekly-article.mjs uz pri vyberu kandidatu, aby stary
// kandidat vubec nebyl zvazovan (misto aby byl vybran, vygenerovan pres API
// a az pak tady zamitnut).
export function computeAgeDays(pubDate, now = Date.now()) {
  if (!isNonEmptyString(pubDate)) return null;
  const parsed = new Date(pubDate);
  if (Number.isNaN(parsed.getTime())) return null;
  return Math.floor((now - parsed.getTime()) / (24 * 60 * 60 * 1000));
}

function validateFreshness(article, manifest, maxAgeDays) {
  const problems = [];
  if (!manifest) return problems;
  if (manifest.length !== article.topics.length) return problems; // uz nahlaseno v validateSourceIntegrity

  manifest.forEach((src, i) => {
    if (!isNonEmptyString(src.pubDate)) {
      problems.push(`topics[${i}] (zdroj "${src.sourceId}"): manifest neobsahuje pubDate - stari nelze overit.`);
      return;
    }
    const ageDays = computeAgeDays(src.pubDate);
    if (ageDays === null) {
      problems.push(`topics[${i}] (zdroj "${src.sourceId}"): pubDate "${src.pubDate}" se nepodarilo naparsovat jako datum.`);
      return;
    }
    if (ageDays > maxAgeDays) {
      problems.push(
        `topics[${i}] (zdroj "${src.sourceId}", "${article.topics[i].title}"): puvodni polozka je stara ${ageDays} dni (pubDate "${src.pubDate}"), limit je ${maxAgeDays} dni.`
      );
    }
  });

  return problems;
}

// Doplnkova heuristika VEDLE validateFreshness, ne nahrada - obe museji
// projit. Resi scenar, kdy je pubDate z RSS feedu samo o sobe nespolehlive
// (viz sk-nds - stary clanek o dialnicni znamce pro rok 2016 s pubDate
// falesne nastavenym na dnesek): hleda primo v "title"/"body" tematu
// ctyrciferna cisla vypadajici jako rok (1900-2099) a oznaci je, pokud jsou
// vice nez MAX_YEAR_AGE_GAP let starsi nez aktualni rok. Budouci roky se
// NEoznacuji (nejsou znamkou zastaralosti). Zamerne benevolentni k false
// positives (napr. rok zmineny v jinem kontextu) - false negative (propustit
// skutecne stary obsah) je tady horsi vysledek.
const YEAR_PATTERN = /\b(19\d{2}|20\d{2})\b/g;

function validateNoStaleYears(article, maxYearAgeGap) {
  const problems = [];
  const currentYear = new Date().getUTCFullYear();

  article.topics.forEach((topic, i) => {
    for (const field of ["title", "body"]) {
      const text = topic[field];
      if (!isNonEmptyString(text)) continue;
      const matches = text.match(YEAR_PATTERN) || [];
      for (const match of matches) {
        const year = Number(match);
        const gap = currentYear - year;
        if (gap > maxYearAgeGap) {
          problems.push(
            `topics[${i}].${field} obsahuje rok ${year} (o ${gap} let starsi nez aktualni rok ${currentYear}, limit je ${maxYearAgeGap} roky) - mozna zastaraly obsah. Text: "${text}"`
          );
        }
      }
    }
  });

  return problems;
}

async function main() {
  const articlePathArg = process.argv[2];
  const manifestPathArg = process.argv[3];

  if (!articlePathArg) {
    console.error("Pouziti: node scripts/validate-article.mjs <cesta-k-clanku.json> [cesta-k-manifestu.json]");
    process.exitCode = 1;
    return;
  }

  let article;
  try {
    article = JSON.parse(await readFile(articlePathArg, "utf-8"));
  } catch (err) {
    fail([`Clanek na "${articlePathArg}" se nepodarilo nacist/naparsovat jako JSON: ${err.message}`]);
    return;
  }

  let manifest = null;
  if (manifestPathArg) {
    try {
      manifest = JSON.parse(await readFile(manifestPathArg, "utf-8"));
    } catch (err) {
      fail([`Manifest na "${manifestPathArg}" se nepodarilo nacist/naparsovat jako JSON: ${err.message}`]);
      return;
    }
  }

  const fieldProblems = validateRequiredFields(article);
  if (fieldProblems.length > 0) {
    fail(fieldProblems);
    return;
  }

  const sourceProblems = validateSourceIntegrity(article, manifest);
  if (sourceProblems.length > 0) {
    fail(sourceProblems);
    return;
  }

  const freshnessProblems = validateFreshness(article, manifest, MAX_AGE_DAYS);
  if (freshnessProblems.length > 0) {
    fail(freshnessProblems);
    return;
  }

  const staleYearProblems = validateNoStaleYears(article, MAX_YEAR_AGE_GAP);
  if (staleYearProblems.length > 0) {
    fail(staleYearProblems);
    return;
  }

  const countries = [...new Set(article.topics.map((t) => t.country))];
  console.log(
    `VALIDACE OK - "${article.title}" (${article.dateRange}): ${article.topics.length} temat, zeme: ${countries.join(", ")}, prah stari: ${MAX_AGE_DAYS} dni.`
  );
}

// Spustit main() jen pri primem `node scripts/validate-article.mjs` - ne pri
// importu MAX_AGE_DAYS/computeAgeDays z generate-weekly-article.mjs, ktery je
// znovupouziva pri vyberu kandidatu. Stejny vzorec jako v generate-test-card.mjs.
const isDirectRun = path.resolve(process.argv[1] || "") === path.resolve(__dirname, "validate-article.mjs");
if (isDirectRun) {
  main().catch((err) => {
    console.error("Neocekavana chyba behu validace:", err);
    process.exitCode = 1;
  });
}
