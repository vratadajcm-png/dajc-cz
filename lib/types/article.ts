export type ArticleTopic = {
  country: string;
  title: string;
  body: string;
  impact?: string;
  validity?: string;
  source: { name: string; url: string };
};

// Preklad prosteho textoveho obsahu clanku do jednoho ciloveho jazyka.
// Ceska verze (top-level pole vyse) zustava kanonicky, lidsky psany zdroj -
// tohle je jen strojovy preklad tehoz obsahu. Zamerne bez source/country/
// dateRange/slug, protoze ty se neprekladaji.
export type ArticleTranslation = {
  title: string;
  lead?: string;
  checklist?: string[];
  topics: Array<{ title: string; body: string; impact?: string; validity?: string }>;
};

export type Article = {
  slug: string;
  title: string;
  dateRange: string;
  lead?: string;
  topics: ArticleTopic[];
  checklist?: string[];
  draft?: boolean;
  // Klic je jazykovy kod (en/de/fr/it/es/pl/nl/ro), viz TARGET_LANGUAGES v
  // scripts/translate-article.mjs. Volitelne - clanky vygenerovane pred
  // zavedenim prekladu ho nemaji. Zatim jen datova vrstva, web ji nevykresluje.
  translations?: Record<string, ArticleTranslation>;
};
