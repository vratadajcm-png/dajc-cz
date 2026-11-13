import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Aktuality DAJC | DAJC.cz",
  description: "Novinky projektu DAJC a týdenní přehled EU Oversize Weekly o evropské nákladní dopravě.",
  alternates: { canonical: "https://www.dajc.cz/aktuality" },
};

export default function Aktuality() {
  return (
    <main className="relative flex min-h-screen flex-col bg-dajc-dark px-6 py-20 text-dajc-white">
      <div className="mx-auto w-full max-w-[760px]">
        <Link href="/" className="font-mono text-sm text-dajc-orange hover:underline">← DAJC.cz</Link>
        <p className="mt-14 font-mono text-xs uppercase tracking-[0.18em] text-dajc-orange">DAJC · aktuality</p>
        <h1 className="mt-5 text-4xl font-semibold leading-tight">Aktuality a EU Oversize Weekly</h1>
        <p className="mt-7 leading-relaxed text-dajc-muted">
          Na evropském webu zveřejňujeme projektové novinky a pravidelný informační přehled
          pro profesionály v evropské těžké a nadrozměrné dopravě.
          Obsah je převážně v angličtině a není náhradou úředních rozhodnutí ani povolení.
        </p>
        <section className="mt-10 rounded-xl border border-dajc-line p-6">
          <h2 className="text-xl font-semibold">Přejít k aktuálním článkům</h2>
          <a className="mt-4 inline-block text-dajc-orange underline" href="https://www.dajc.eu/news">
            Otevřít novinky na DAJC.eu →
          </a>
          <p className="mt-6 text-sm text-dajc-muted">
            Odběr novinek a jednorázového oznámení připravovaného spuštění:
          </p>
          <a className="mt-2 inline-block text-dajc-orange underline" href="https://www.dajc.eu/updates">
            Možnosti odběru na DAJC.eu →
          </a>
        </section>
        <p className="mt-8 text-sm text-dajc-muted">
          DAJC Platform a DAJC TAR jsou ve vývoji; zveřejňované informace neznamenají
          dostupnost komerční služby.
        </p>
      </div>
    </main>
  );
}
