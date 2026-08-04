import type { ArticleTopic } from "@/lib/types/article";
import { countryFlag } from "@/lib/countryFlag";

export function TopicCard({ topic }: { topic: ArticleTopic }) {
  return (
    <article className="rounded-2xl border border-dajc-orange/60 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-slate-500">
        <span title={topic.country}>{countryFlag(topic.country)}</span>
        <span>{topic.country}</span>
      </div>
      <h3 className="mt-2 font-heading text-lg font-semibold text-dajc-navy">
        {topic.title}
      </h3>
      <p className="mt-3 text-slate-700">{topic.body}</p>

      {topic.impact && (
        <div className="mt-4 rounded-xl bg-dajc-navy/5 p-4">
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-dajc-navy">
            Dopad na přepravu
          </p>
          <p className="mt-1 text-sm text-slate-700">{topic.impact}</p>
        </div>
      )}

      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-slate-200 pt-4 font-mono text-xs text-slate-500">
        {topic.validity && (
          <div className="flex gap-1">
            <dt className="font-semibold text-slate-600">Platnost:</dt>
            <dd>{topic.validity}</dd>
          </div>
        )}
        <div className="flex gap-1">
          <dt className="font-semibold text-slate-600">Zdroj:</dt>
          <dd>
            <a
              href={topic.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-dajc-orange hover:underline"
            >
              {topic.source.name}
            </a>
          </dd>
        </div>
      </dl>
    </article>
  );
}
