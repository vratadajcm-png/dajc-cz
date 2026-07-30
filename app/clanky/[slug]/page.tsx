import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllArticles, getArticleBySlug } from "@/lib/articles";

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
    description: article.excerpt || undefined,
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
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <Link href="/clanky" className="text-sm text-dajc-orange hover:underline">
        &larr; Zpět na novinky
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-dajc-navy">
        {article.title}
      </h1>
      {article.date && (
        <p className="mt-2 text-sm text-slate-400">{article.date}</p>
      )}
      <div
        className="prose prose-slate mt-8 max-w-none"
        dangerouslySetInnerHTML={{ __html: article.contentHtml }}
      />
    </main>
  );
}
