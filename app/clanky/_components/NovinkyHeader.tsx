import Link from "next/link";

export function NovinkyHeader() {
  return (
    <header className="bg-dajc-dark px-6 py-8 text-white">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <Link href="/" className="shrink-0">
          <img
            src="/brand/DAJC-logo-dark-480w.png"
            alt="DAJC"
            width={140}
            height={37}
            className="h-auto w-[140px]"
          />
        </Link>
        <div>
          <p className="font-heading text-xl font-semibold sm:text-2xl">
            Novinky z oversize cargo
          </p>
          <p className="mt-1 font-mono text-xs uppercase tracking-wider text-white/60">
            Týdenní přehled pro nadrozměrnou a těžkou přepravu
          </p>
        </div>
      </div>
    </header>
  );
}
