import Link from "next/link";
import type { Article } from "@/lib/types/article";
import { countryFlag } from "@/lib/countryFlag";

export function ArticleCard({ article }: { article: Article }) {
  const countries = [...new Set(article.topics.map((topic) => topic.country))];

  return (
    <li className="rounded-2xl border border-dajc-orange/60 bg-white p-6 shadow-sm transition hover:border-dajc-orange">
      <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-wider text-slate-500">
        <span>{article.dateRange}</span>
        <span aria-hidden="true">·</span>
        <span className="flex items-center gap-1">
          {countries.map((country) => (
            <span key={country} title={country}>
              {countryFlag(country)}
            </span>
          ))}
        </span>
        <span aria-hidden="true">·</span>
        <span>
          {article.topics.length}{" "}
          {article.topics.length === 1 ? "zdroj" : "zdrojů"}
        </span>
      </div>
      <h2 className="mt-3 font-heading text-xl font-semibold text-dajc-navy">
        {article.title}
      </h2>
      <Link
        href={`/clanky/${article.slug}`}
        className="mt-4 inline-flex items-center gap-1 font-semibold text-dajc-orange hover:underline"
      >
        Číst více <span aria-hidden="true">→</span>
      </Link>
    </li>
  );
}
