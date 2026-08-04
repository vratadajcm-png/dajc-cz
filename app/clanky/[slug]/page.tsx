import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllArticles, getArticleBySlug } from "@/lib/articles";
import { NovinkyHeader } from "../_components/NovinkyHeader";
import { TopicCard } from "../_components/TopicCard";
import { Checklist } from "../_components/Checklist";

type PageParams = { slug: string };

export function generateStaticParams(): PageParams[] {
  return getAllArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {};
  }

  return {
    title: article.title,
    description: article.lead,
  };
}

export default async function ClanekPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <>
      <NovinkyHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <Link href="/clanky" className="text-sm text-dajc-orange hover:underline">
          &larr; Zpět na novinky
        </Link>
        <h1 className="mt-4 font-heading text-3xl font-bold text-dajc-navy">
          {article.title}
        </h1>
        <p className="mt-2 font-mono text-sm text-slate-400">{article.dateRange}</p>

        {article.lead && (
          <p className="mt-6 text-lg leading-relaxed text-slate-700">{article.lead}</p>
        )}

        <p className="mt-10 font-mono text-xs font-semibold uppercase tracking-wider text-dajc-navy">
          Konkrétní změny tento týden
        </p>
        <div className="mt-4 space-y-6">
          {article.topics.map((topic, index) => (
            <TopicCard key={`${topic.country}-${index}`} topic={topic} />
          ))}
        </div>

        {article.checklist && article.checklist.length > 0 && (
          <div className="mt-10">
            <Checklist items={article.checklist} />
          </div>
        )}

        <p className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-400">
          Tento přehled je informativní a nenahrazuje oficiální vyhlášky ani
          sdělení příslušných úřadů či správců infrastruktury. Před
          plánováním konkrétní přepravy vždy ověřte aktuální podmínky u
          zdroje uvedeného u dané zprávy.
        </p>
      </main>
    </>
  );
}
