import Link from "next/link";

const benefits = [
  {
    title: "Koordinace zakázek na jednom místě",
    description:
      "Nabídky, poptávky i stav přepravy nadrozměrných a těžkých nákladů najdete přehledně na jedné platformě, bez roztříštěné komunikace po telefonu a e-mailu.",
  },
  {
    title: "Žádné provize z přepravy",
    description:
      "DAJC si neúčtuje procenta z vaší zakázky. Platíte za přístup k platformě, ne za to, kolik nákladu převezete.",
  },
  {
    title: "Předplatné za organizaci, ne za náklad",
    description:
      "Jasný a předvídatelný model předplatného pokrývá organizaci a správu zakázek — bez skrytých poplatků navázaných na objem přepravy.",
  },
];

export default function Home() {
  return (
    <>
      <section className="bg-dajc-dark px-6 py-24 text-white">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <img
            src="/brand/DAJC-logo-dark-800w.png"
            alt="DAJC"
            width={220}
            height={59}
            className="h-auto w-[220px]"
          />
          <h1 className="mt-10 text-3xl font-bold sm:text-5xl">
            DAJC — platforma pro těžkou a nadrozměrnou přepravu
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80">
            Jedna přepravní zakázka. Jedno D-ID. Všechny její kroky, partneři
            a dokumenty propojené – od plánování až po doručení napříč
            Evropou. Jednotné digitální místo, kde se z nákladu stává řízená
            přepravní zakázka.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <a
              href="https://dajc.eu"
              className="inline-flex items-center justify-center rounded-full bg-dajc-orange px-8 py-4 text-lg font-semibold text-dajc-dark transition hover:brightness-110"
            >
              Otevřít platformu na dajc.eu
            </a>
            <a
              href="#novinky"
              className="inline-flex items-center justify-center rounded-full border-2 border-dajc-orange px-8 py-4 text-lg font-semibold text-dajc-orange transition hover:bg-dajc-orange hover:text-dajc-dark"
            >
              Novinky v oversize
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-dajc-navy sm:text-3xl">
            Co je DAJC
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border border-slate-200 p-6"
              >
                <h3 className="text-lg font-semibold text-dajc-navy">
                  {benefit.title}
                </h3>
                <p className="mt-3 text-slate-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="novinky" className="scroll-mt-6 bg-slate-50 px-6 py-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <h2 className="text-2xl font-bold text-dajc-navy sm:text-3xl">
            Novinky z oversize cargo
          </h2>
          <p className="mt-4 text-slate-600">
            Pravidelně sledujeme dění ve světě nadrozměrné a těžké přepravy a
            shrnujeme ho do krátkých článků.
          </p>
          <Link
            href="/clanky"
            className="mt-8 inline-flex items-center justify-center rounded-full border-2 border-dajc-navy px-6 py-3 font-semibold text-dajc-navy transition hover:bg-dajc-navy hover:text-white"
          >
            Zobrazit novinky
          </Link>
        </div>
      </section>

      <footer className="mt-auto bg-dajc-navy px-6 py-10 text-white/80">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <img
            src="/brand/DAJC-logo-dark-800w.png"
            alt="DAJC"
            width={140}
            height={37}
            className="h-auto w-[140px]"
          />
          <div className="text-sm">
            <p>
              Kontakt:{" "}
              <a
                href="mailto:team@dajc.eu"
                className="text-dajc-orange hover:underline"
              >
                team@dajc.eu
              </a>
            </p>
            <p className="mt-1">
              <a
                href="https://dajc.eu"
                className="text-dajc-orange hover:underline"
              >
                dajc.eu
              </a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
