export function Checklist({ items }: { items: string[] }) {
  return (
    <div className="rounded-2xl border-2 border-dajc-navy bg-dajc-navy/5 p-6">
      <p className="font-mono text-xs font-semibold uppercase tracking-wider text-dajc-navy">
        Checklist na tento týden
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
            <span className="mt-0.5 text-dajc-orange" aria-hidden="true">
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
