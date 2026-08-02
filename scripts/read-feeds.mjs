#!/usr/bin/env node
// Faze 2 - overeni ctecich adapteru pro RSS/Atom zdroje z data/oversize-news-sources.json.
// Negeneruje zadny obsah, jen zkousi stahnout a naparsovat kazdy feed a ulozit vysledek
// do reports/feed-read-test.json pro rucni revizi. Zadny zdroj nesmi shodit cely beh.

import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import Parser from "rss-parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SOURCES_PATH = path.join(ROOT, "data", "oversize-news-sources.json");
const REPORT_PATH = path.join(ROOT, "reports", "feed-read-test.json");

const FETCH_TIMEOUT_MS = 15_000;
const MAX_ITEMS_PER_SOURCE = 5;

// Notes v registru popisuji presnou, uz rucne overenou URL feedu (napr. "Realny
// funkcni WordPress RSS feed overen primo: https://ndsas.sk/feed"), ale samotne
// pole "url" u zdroje je vetsinou jen homepage/domena, ne primo feed. Tahle
// tabulka je ta overena URL vytazena z poznamek Fazi 1b/1c/1d - drzet ji aktualni,
// pokud se zdroj v registru zmeni. Pro zdroje, ktere v tabulce nejsou (napr. nove
// pridane v pozdejsich fazich), se pouzije obecny odhad v resolveFeedCandidates().
const KNOWN_FEED_URLS = {
  "no-vegvesen": "https://www.vegvesen.no/rss",
  "sk-ssc": "http://feeds.feedburner.com/sscsk",
  "sk-nds": "https://ndsas.sk/feed",
  "hu-kozut": "https://internet.kozut.hu/feed/",
  "fi-vayla": "https://vayla.fi/etusivu/-/asset_publisher/u5RcGPuiQLSZ/rss",
  "uk-govuk-dft":
    "https://www.gov.uk/search/news-and-communications.atom?organisations%5B%5D=department-for-transport",
  "de-polizei-blaulicht": "https://www.presseportal.de/rss/blaulicht.rss2",
  "pl-policja": "https://www.policja.pl/dokumenty/rss/1-rss-1.rss",
  "uk-npcc": "https://news.npcc.police.uk/feed/rss",
  "lt-vialietuva": "https://vialietuva.lt/feed",
  "lv-lvceli": "https://lvceli.lv/feed/",
  "mk-roads": "https://roads.org.mk/feed/",
  "al-arrsh": "https://www.arrsh.gov.al/feed",
  "al-asp": "https://asp.gov.al/feed/",
  "xk-kosovopolice": "https://www.kosovopolice.com/feed/",
  "md-drumuri": "https://drumuri.md/feed/",
  "by-belavtodor": "https://belavtodor.by/feed/",
  "ua-restoration": "https://restoration.gov.ua/feed/",
  "mc-gouv": "https://www.gouv.mc/rss/feed/portail-gouv-actualites-fr",
};

// Zdroje, jejichz poznamka v registru vysloven zminuje nevalidni/netypicke XML
// (napr. lv-lvceli - <script> tag pred XML deklaraci). U nich se parse chyba
// po vsech pokusech o shovivave parsovani hlasi jako "needs_manual_review",
// ne jako bezna chyba.
const INVALID_XML_NOTE_PATTERN = /nevalidn[ií].{0,20}xml|xml.{0,20}nevalidn/i;

function extractCandidateUrlsFromNote(note) {
  if (!note) return [];
  const matches = note.match(/https?:\/\/[^\s'"<>)]+/g) || [];
  return matches
    .map((u) => u.replace(/[.,;]+$/, ""))
    .filter((u) => /feed|rss|atom/i.test(u));
}

function resolveFeedCandidates(source) {
  const known = KNOWN_FEED_URLS[source.id];
  const candidates = [];
  if (known) candidates.push(known);
  candidates.push(...extractCandidateUrlsFromNote(source.note));
  const base = source.url.replace(/\/$/, "");
  candidates.push(base, `${base}/feed`, `${base}/feed/`, `${base}/rss`);
  // dedupe, zachovej poradi priority
  return [...new Set(candidates)];
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; DajcFeedReadTest/1.0; +https://dajc.cz)",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
      redirect: "follow",
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// Odstrani jakykoliv obsah pred prvnim '<?xml', '<rss' nebo '<feed' tagem -
// resi napr. lv-lvceli, kde je pred XML deklaraci vlozeny <script> tag s JS.
function sanitizeXml(raw) {
  const match = raw.search(/<\?xml|<rss[\s>]|<feed[\s>]/i);
  if (match <= 0) return raw;
  return raw.slice(match);
}

function classifyFetchError(err) {
  if (err.name === "AbortError") return "timeout";
  const causeCode = err.cause && String(err.cause.code || "");
  const causeMessage = err.cause && String(err.cause.message || "");
  if (/ENOTFOUND|EAI_AGAIN/.test(causeCode)) return "dns_error";
  if (/ECONNREFUSED|ECONNRESET|ETIMEDOUT/.test(causeCode)) return "network_error";
  if (
    /CERT|UNABLE_TO_VERIFY|SELF_SIGNED|certificate/i.test(causeCode) ||
    /certificate|TLS|SSL/i.test(causeMessage) ||
    /certificate|TLS|SSL/i.test(err.message)
  ) {
    return "tls_error";
  }
  return "network_error";
}

function describeError(err) {
  // Pro TypeError('fetch failed') je skutecny popis schovany v err.cause.
  if (err.cause && err.cause.message) {
    return `${err.message}: ${err.cause.message}`;
  }
  return err.message;
}

function firstNonEmpty(...vals) {
  return vals.find((v) => v !== undefined && v !== null && v !== "") ?? null;
}

async function tryReadFeed(parser, url) {
  const res = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`);
    err.errorType = "http_error";
    err.httpStatus = res.status;
    throw err;
  }
  const raw = await res.text();
  const cleaned = sanitizeXml(raw);
  const feed = await parser.parseString(cleaned);
  return feed;
}

async function processSource(parser, source) {
  const candidates = resolveFeedCandidates(source);
  const isKnownInvalidXml = INVALID_XML_NOTE_PATTERN.test(source.note || "");
  const attempts = [];
  let lastErrorType = "parse_error";
  let lastErrorMessage = "Neznama chyba";

  for (const url of candidates) {
    try {
      const feed = await tryReadFeed(parser, url);
      const items = (feed.items || []).slice(0, MAX_ITEMS_PER_SOURCE).map((item) => ({
        title: firstNonEmpty(item.title),
        link: firstNonEmpty(item.link),
        pubDate: firstNonEmpty(item.pubDate, item.isoDate, item.updated, item.published),
      }));

      if (items.length === 0) {
        attempts.push({ url, errorType: "empty_feed", message: "Feed se naparsoval, ale neobsahuje zadne polozky" });
        lastErrorType = "empty_feed";
        lastErrorMessage = attempts[attempts.length - 1].message;
        continue; // zkus dalsi kandidatni URL, treba je lepsi
      }

      return {
        id: source.id,
        country: source.country,
        name: source.name,
        status: "ok",
        feedUrlUsed: url,
        attemptsBeforeSuccess: attempts.length,
        itemCount: items.length,
        sampleFirstItem: items[0],
        items,
      };
    } catch (err) {
      const errorType =
        err.errorType || (/xml|parse|entity|Non-whitespace/i.test(err.message) ? "parse_error" : classifyFetchError(err));
      const message = describeError(err);
      attempts.push({ url, errorType, message });
      lastErrorType = errorType;
      lastErrorMessage = message;
      // pokracuj na dalsi kandidatni URL
    }
  }

  if (isKnownInvalidXml && lastErrorType === "parse_error") {
    return {
      id: source.id,
      country: source.country,
      name: source.name,
      status: "needs_manual_review",
      attempts,
      errorType: "invalid_xml_unparseable",
      errorMessage: lastErrorMessage,
    };
  }

  return {
    id: source.id,
    country: source.country,
    name: source.name,
    status: "error",
    attempts,
    errorType: lastErrorType,
    errorMessage: lastErrorMessage,
  };
}

async function main() {
  const raw = await readFile(SOURCES_PATH, "utf-8");
  const registry = JSON.parse(raw);
  const feedSources = registry.sources.filter(
    (s) => s.type === "rss" || s.type === "atom"
  );

  console.log(`Nacten registr: ${registry.sources.length} zdroju celkem.`);
  console.log(
    `Vyfiltrovano ${feedSources.length} zdroju typu rss/atom (ostatni typy - sitemap/html-list/manual/playwright - ignorovany, na rade v pozdejsi fazi).\n`
  );

  const parser = new Parser({
    timeout: FETCH_TIMEOUT_MS,
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; DajcFeedReadTest/1.0; +https://dajc.cz)",
    },
  });

  const results = [];
  for (const source of feedSources) {
    process.stdout.write(`[${source.id}] (${source.country}) ... `);
    const result = await processSource(parser, source);
    results.push(result);
    if (result.status === "ok") {
      console.log(`OK - ${result.itemCount} polozek (${result.feedUrlUsed})`);
    } else if (result.status === "needs_manual_review") {
      console.log(`POTREBA RUCNI REVIZE - ${result.errorMessage}`);
    } else {
      console.log(`CHYBA (${result.errorType}) - ${result.errorMessage}`);
    }
  }

  const ok = results.filter((r) => r.status === "ok");
  const needsReview = results.filter((r) => r.status === "needs_manual_review");
  const errors = results.filter((r) => r.status === "error");

  const errorsByType = {};
  for (const r of errors) {
    errorsByType[r.errorType] = (errorsByType[r.errorType] || 0) + 1;
  }

  console.log("\n=== SOUHRN ===");
  console.log(`Zkuseno: ${results.length}`);
  console.log(`Uspech:  ${ok.length}`);
  console.log(`Chyba:   ${errors.length}`);
  console.log(`Rucni revize (nevalidni XML): ${needsReview.length}`);
  if (Object.keys(errorsByType).length > 0) {
    console.log("Chyby podle typu:");
    for (const [type, count] of Object.entries(errorsByType)) {
      console.log(`  - ${type}: ${count}`);
    }
  }
  if (errors.length > 0) {
    console.log("\nSelhaly zdroje:");
    for (const r of errors) {
      console.log(`  - ${r.id} (${r.country}): ${r.errorType} - ${r.errorMessage}`);
    }
  }
  if (needsReview.length > 0) {
    console.log("\nZdroje k rucni revizi:");
    for (const r of needsReview) {
      console.log(`  - ${r.id} (${r.country}): ${r.errorMessage}`);
    }
  }

  await mkdir(path.dirname(REPORT_PATH), { recursive: true });
  const report = {
    generated_at: new Date().toISOString(),
    total_sources_in_registry: registry.sources.length,
    total_feed_sources_tried: results.length,
    summary: {
      ok: ok.length,
      error: errors.length,
      needs_manual_review: needsReview.length,
      errors_by_type: errorsByType,
    },
    results,
  };
  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2), "utf-8");
  console.log(`\nKompletni vysledek ulozen do ${path.relative(ROOT, REPORT_PATH)}`);
}

main().catch((err) => {
  // Toto by nemelo nikdy nastat (kazdy zdroj je izolovany v try/catch), ale
  // pro jistotu at skript zretelne selze s chybou, ne tise.
  console.error("Neocekavana chyba behu skriptu:", err);
  process.exitCode = 1;
});
