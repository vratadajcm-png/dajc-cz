import type { Metadata } from "next";
import { getAllArticles } from "@/lib/articles";
import { NovinkyHeader } from "./_components/NovinkyHeader";
import { ArticleCard } from "./_components/ArticleCard";

export const metadata: Metadata = {
  title: "Novinky z oversize cargo",
  description:
    "Novinky a postřehy ze světa nadrozměrné a těžké přepravy, doplňkově k platformě DAJC.",
};

export default function ClankyPage() {
  const articles = getAllArticles();

  return (
    <>
      <NovinkyHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        {articles.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-slate-500">
            Zatím žádné články.
          </p>
        ) : (
          <ul className="space-y-6">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
