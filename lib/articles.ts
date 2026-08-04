import fs from "node:fs";
import path from "node:path";
import type { Article } from "@/lib/types/article";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

function readArticle(fileName: string): Article {
  const raw = fs.readFileSync(path.join(ARTICLES_DIR, fileName), "utf8");
  const data = JSON.parse(raw) as Article;
  return { ...data, slug: fileName.replace(/\.json$/, "") };
}

function listArticleFiles(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) {
    return [];
  }
  return fs.readdirSync(ARTICLES_DIR).filter((fileName) => fileName.endsWith(".json"));
}

// Soubory pojmenované s ISO datem na začátku (např. 2026-08-03-...json) se
// tak řadí chronologicky i abecedně — pro publikované články používejte
// tuto konvenci v názvu souboru.
export function getAllArticles(): Article[] {
  return listArticleFiles()
    .map(readArticle)
    .filter((article) => !article.draft)
    .sort((a, b) => (a.slug < b.slug ? 1 : -1));
}

export function getArticleBySlug(slug: string): Article | null {
  const filePath = path.join(ARTICLES_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return readArticle(`${slug}.json`);
}
