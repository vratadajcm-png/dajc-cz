import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kontakt | DAJC.cz",
  description: "Český kontakt pro zájemce o DAJC Platform, DAJC TAR, spolupráci a aktualizace projektu.",
  alternates: { canonical: "https://www.dajc.cz/kontakt" },
};

export default function Kontakt() {
  return (
    <main className="relative flex min-h-screen flex-col bg-dajc-dark px-6 py-20 text-dajc-white">
      <div className="mx-auto w-full max-w-[760px]">
        <Link href="/" className="font-mono text-sm text-dajc-orange hover:underline">← DAJC.cz</Link>
        <p className="mt-14 font-mono text-xs uppercase tracking-[0.18em] text-dajc-orange">DAJC · kontakt</p>
        <h1 className="mt-5 text-4xl font-semibold leading-tight">Spojte se s DAJC</h1>
        <p className="mt-7 leading-relaxed text-dajc-muted">
          DAJC Platform i DAJC TAR jsou ve vývoji. Pro dotazy k projektu, možnostem spolupráce
          nebo technickému napojení využijte e-mail. Zpráva nezakládá objednávku komerční služby.
        </p>
        <section className="mt-10 rounded-xl border border-dajc-line p-6">
          <h2 className="text-xl font-semibold">Projekt a spolupráce</h2>
          <p className="mt-3 text-dajc-muted">E-mail pro obecné a obchodní dotazy:</p>
          <a className="mt-3 inline-block text-dajc-orange underline" href="mailto:team@dajc.eu">team@dajc.eu</a>
          <h2 className="mt-9 text-xl font-semibold">Testování DAJC Platform</h2>
          <p className="mt-3 text-dajc-muted">
            Předprodukční testování je plánováno na 3. čtvrtletí 2027. Přesný termín zatím není potvrzen.
          </p>
          <Link href="/testovani" className="mt-3 inline-block text-dajc-orange underline">
            Informace a registrace k testování →
          </Link>
          <h2 className="mt-9 text-xl font-semibold">Novinky a oznámení spuštění</h2>
          <p className="mt-3 text-dajc-muted">
            O aktuální možnosti odběru informuje hlavní evropský web (v angličtině).
          </p>
          <a href="https://www.dajc.eu/updates" className="mt-3 inline-block text-dajc-orange underline">
            Novinky a oznámení →
          </a>
        </section>
        <p className="mt-8 text-sm text-dajc-muted">
          Informace o zpracování osobních údajů naleznete v{" "}
          <a href="https://www.dajc.eu/privacy" className="text-dajc-orange underline">zásadách ochrany soukromí</a>.
        </p>
      </div>
    </main>
  );
}
