#!/usr/bin/env node
// Faze 6 - preklad validovaneho tydenniho clanku pres DeepL API do vedlejsich
// jazyku. Bezi jako TRETI a POSLEDNI samostatny krok pipeline (generate ->
// validate -> translate), az PO uspesne validaci - preklad obsahu, ktery by
// validace mohla stejne zamitnout (stale-year, zmeneny zdroj...), by jen
// zbytecne utracel DeepL znaky za neco, co nikdy nevyjde.
//
// cs (top-level pole v article JSON) zustava lidsky psany/revidovany zdroj -
// nemeni se. Preklady se ukladaji do noveho pole "translations" uvnitr
// STEJNEHO article JSON (ne do samostatnych souboru per jazyk), aby clanek
// zustal jednou atomickou jednotkou pro validate-article.mjs i pozdejsi
// rendering. Zatim jen datova vrstva - web preklady nevykresluje (samostatny
// navazujici ukol: i18n routing, prepinac jazyka, layout).
//
// Pouziti:
//   node scripts/translate-article.mjs content/articles/<slug>.json

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvLocal } from "./generate-test-card.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Cilove jazyky (bez cestiny - ta je zdroj). Klice pouzite i v Article.translations.
export const TARGET_LANGUAGES = ["en", "de", "fr", "it", "es", "pl", "nl", "ro"];

// DeepL kody pro target_lang - vetsina odpovida nasim kodum, "en" je
// vyjimka (DeepL vyzaduje konkretni variantu, ne holé "EN").
const DEEPL_TARGET_LANG = {
  en: "EN-US",
  de: "DE",
  fr: "FR",
  it: "IT",
  es: "ES",
  pl: "PL",
  nl: "NL",
  ro: "RO",
};

// DeepL rozlisuje Free/Pro ucty podle hostname - klice na Free tarifu maji
// sufix ":fx" (stejna konvence jako oficialni deepl-node klient).
function deeplApiUrl(apiKey) {
  const isFreeKey = apiKey.endsWith(":fx");
  return `https://api${isFreeKey ? "-free" : ""}.deepl.com/v2/translate`;
}

// Preklada VSECHNA textova pole clanku jednim pozadavkem na jazyk (ne pole
// po poli) - DeepL v2/translate prijima vice "text" parametru najednou a
// vraci preklady ve stejnem poradi, v jakem byly poslany.
async function translateTexts(apiKey, texts, deeplTargetLang) {
  const params = new URLSearchParams();
  params.set("target_lang", deeplTargetLang);
  params.set("source_lang", "CS");
  for (const t of texts) params.append("text", t);

  const response = await fetch(deeplApiUrl(apiKey), {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`DeepL API chyba (${response.status}) pro cilovy jazyk ${deeplTargetLang}: ${body}`);
  }

  const data = await response.json();
  return data.translations.map((t) => t.text);
}

// Sestavi plochy seznam textu k prekladu z clanku ("texts") a k nemu paralelni
// seznam "assign" funkci, ktere po prekladu poskladaji translations[lang] ze
// stejne serazenych vysledku zpet do puvodni struktury. Prekladaji se jen
// prosta textova pole - title/lead/checklist[]/topics[].{title,body,impact,validity}.
// NEprekladaji se: source.name/url, country, dateRange, slug (viz Article typ).
export function buildTranslationPlan(article) {
  const texts = [];
  const assign = [];

  const pushField = (value, setter) => {
    if (typeof value !== "string" || value.trim().length === 0) return;
    const index = texts.length;
    texts.push(value);
    assign.push((translatedTexts, target) => setter(target, translatedTexts[index]));
  };

  pushField(article.title, (target, v) => (target.title = v));
  pushField(article.lead, (target, v) => (target.lead = v));

  (article.checklist || []).forEach((item, i) => {
    pushField(item, (target, v) => {
      target.checklist = target.checklist || [];
      target.checklist[i] = v;
    });
  });

  article.topics.forEach((topic, i) => {
    for (const field of ["title", "body", "impact", "validity"]) {
      pushField(topic[field], (target, v) => {
        target.topics = target.topics || [];
        target.topics[i] = target.topics[i] || {};
        target.topics[i][field] = v;
      });
    }
  });

  return { texts, assign };
}

export function assembleTranslation(assign, translatedTexts) {
  const target = {};
  for (const fn of assign) fn(translatedTexts, target);
  return target;
}

async function main() {
  // Stejny vzorec jako u ANTHROPIC_API_KEY v generate-weekly-article.mjs:
  // .env.local jen pro lokalni vyvoj, v GH Actions prijde DEEPL_API_KEY jako
  // realna env promenna ze secretu.
  await loadEnvLocal();
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    console.error("DEEPL_API_KEY neni nastaveny (ani v .env.local, ani v prostredi). Zastavuji se.");
    process.exitCode = 1;
    return;
  }

  const articlePathArg = process.argv[2];
  if (!articlePathArg) {
    console.error("Pouziti: node scripts/translate-article.mjs <cesta-k-clanku.json>");
    process.exitCode = 1;
    return;
  }

  const articlePath = path.resolve(articlePathArg);
  const article = JSON.parse(await readFile(articlePath, "utf-8"));

  const { texts, assign } = buildTranslationPlan(article);
  if (texts.length === 0) {
    console.error("Clanek neobsahuje zadny prekladatelny text. Zastavuji se.");
    process.exitCode = 1;
    return;
  }

  console.log(`Prekladam ${texts.length} textovych poli do ${TARGET_LANGUAGES.length} jazyku (${TARGET_LANGUAGES.join(", ")})...`);

  const translations = {};
  for (const lang of TARGET_LANGUAGES) {
    const translatedTexts = await translateTexts(apiKey, texts, DEEPL_TARGET_LANG[lang]);
    translations[lang] = assembleTranslation(assign, translatedTexts);
    console.log(`  [${lang}] OK`);
  }

  article.translations = translations;
  await writeFile(articlePath, JSON.stringify(article, null, 2) + "\n", "utf-8");
  console.log(`\nPreklady zapsany do ${path.relative(ROOT, articlePath).replace(/\\/g, "/")}`);
}

// Stejny vzorec jako v ostatnich skriptech pipeline - main() jen pri primem
// spusteni, ne pri importu (napr. buildTranslationPlan pro testy).
const isDirectRun = path.resolve(process.argv[1] || "") === path.resolve(__dirname, "translate-article.mjs");
if (isDirectRun) {
  main().catch((err) => {
    console.error("Neocekavana chyba behu skriptu:", err);
    process.exitCode = 1;
  });
}
