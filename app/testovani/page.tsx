import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Testování DAJC Platform – 3. čtvrtletí 2027",
  description:
    "Předprodukční testování DAJC Platform je plánováno na červenec až září 2027. Přesný termín bude upřesněn. Registrace zájemců probíhá na dajc.eu.",
  alternates: { canonical: "https://www.dajc.cz/testovani" },
  openGraph: {
    title: "DAJC Platform – testování Q3 2027",
    description: "Předprodukční testování je plánováno na červenec až září 2027.",
    url: "https://www.dajc.cz/testovani",
    locale: "cs_CZ",
  },
};

export default function Testovani() {
  return (
    <main className="relative flex min-h-screen flex-col items-center bg-dajc-dark px-6 py-20 text-dajc-white">
      <div className="w-full max-w-[760px]">
        <a href="/" className="font-mono text-xs uppercase tracking-[0.08em] text-dajc-orange hover:underline">
          &larr; DAJC.cz
        </a>
        <p className="mt-14 font-mono text-xs uppercase tracking-[0.18em] text-dajc-orange">
          DAJC Platform · vývoj a testování
        </p>
        <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
          Předprodukční testování: 3. čtvrtletí 2027
        </h1>
        <p className="mt-7 text-lg leading-relaxed text-dajc-muted">
          Zahájení testování DAJC Platform je plánováno na období od července do září 2027.
          Přesné datum není zatím potvrzeno. Původní termín 4. ledna 2027 již neplatí.
        </p>
        <section className="mt-10 rounded-xl border border-dajc-line p-6" aria-label="Podmínky testování">
          <h2 className="text-2xl font-semibold">Registrace zájemců zůstává otevřená</h2>
          <p className="mt-4 leading-relaxed text-dajc-muted">
            Registrace je určena dopravcům, dispečerům, řidičům, zadavatelům přeprav,
            doprovodným službám a dalším odborníkům v těžké a nadrozměrné dopravě.
            Testování bude probíhat na vyvíjeném produktu. Nejde o zákaznický pilot,
            produkční Early Access ani o dostupnou komerční službu.
          </p>
          <p className="mt-4 text-sm text-dajc-muted">
            Datum harmonogramu aktualizováno 27. října 2026.
          </p>
          <a
            href="https://www.dajc.eu/testing"
            className="mt-7 inline-flex items-center justify-center rounded-full bg-dajc-orange px-6 py-3 font-semibold text-dajc-dark hover:brightness-110"
          >
            Otevřít registrační formulář (anglicky) &rarr;
          </a>
        </section>
        <p className="mt-8 text-sm leading-relaxed text-dajc-muted">
          O potvrzeném datu a podmínkách účasti budou registrovaní zájemci informováni.
          Další informace: <a href="mailto:platform@dajc.cz" className="text-dajc-orange hover:underline">platform@dajc.cz</a>.
        </p>
      </div>
    </main>
  );
}
