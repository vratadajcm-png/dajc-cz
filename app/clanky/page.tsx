import Link from "next/link";
import type { Metadata } from "next";
import { getAllArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Novinky z oversize cargo",
  description:
    "Novinky a postřehy ze světa nadrozměrné a těžké přepravy, doplňkově k platformě HaulBoard.eu.",
};

export default function ClankyPage() {
  const articles = getAllArticles();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <h1 className="text-3xl font-bold text-dajc-navy">
        Novinky z oversize cargo
      </h1>
      <p className="mt-4 text-slate-600">
        Krátké zprávy a postřehy ze světa nadrozměrné a těžké přepravy,
        doplňkově k platformě{" "}
        <a
          href="https://haulboard.eu"
          className="text-dajc-orange hover:underline"
        >
          HaulBoard.eu
        </a>
        .
      </p>

      {articles.length === 0 ? (
        <p className="mt-12 rounded-lg border border-slate-200 bg-slate-50 p-6 text-slate-500">
          Zatím žádné články.
        </p>
      ) : (
        <ul className="mt-12 space-y-8">
          {articles.map((article) => (
            <li
              key={article.slug}
              className="border-b border-slate-200 pb-8"
            >
              <Link
                href={`/clanky/${article.slug}`}
                className="text-xl font-semibold text-dajc-navy hover:text-dajc-orange"
              >
                {article.title}
              </Link>
              {article.date && (
                <p className="mt-1 text-sm text-slate-400">{article.date}</p>
              )}
              {article.excerpt && (
                <p className="mt-2 text-slate-600">{article.excerpt}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
