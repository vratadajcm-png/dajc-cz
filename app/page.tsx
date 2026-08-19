const storyParagraphs = [
  "Těžká a nadrozměrná přeprava patří mezi nejsložitější oblasti silniční logistiky.",
  "Jedna jediná přeprava může zahrnovat povolení, omezení trasy, doprovody, policejní koordinaci, hraniční procedury, speciální parkování, technická omezení infrastruktury, dokumenty a několik různých firem.",
  "V praxi se tyto části často řeší odděleně - v různých systémech, e-mailech, telefonátech, tabulkách, komunikačních aplikacích a lokálních portálech.",
  "DAJC vzniká právě z této provozní reality.",
  "Cílem je propojit lidi, informace, dokumenty a služby potřebné pro plánování a realizaci těžké a nadrozměrné přepravy napříč Evropou.",
  "DAJC nechce být další burzou nákladů ani dalším prostředníkem mezi zákazníkem a dopravcem.",
  "Cílem je lepší koordinace.",
  "Platforma se vyvíjí postupně podle skutečných provozních potřeb a propojuje informace a nástroje, které pomáhají přepravu plánovat, sledovat a realizovat efektivněji.",
];

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-dajc-dark text-dajc-white">
      <div className="grid-bg" aria-hidden="true" />

      <main className="relative z-10 flex flex-1 flex-col items-center px-6 py-24">
        <div className="flex flex-col items-center text-center">
          <img
            src="/brand/DAJC-logo-dark-800w.png"
            alt="DAJC"
            width={220}
            height={59}
            className="h-auto w-[220px]"
          />

          <p className="mt-10 font-mono text-xs tracking-[0.2em] text-dajc-orange uppercase">
            European heavy &amp; oversized transport platform
          </p>
        </div>

        <div className="mt-14 w-full max-w-[720px] border-t border-b border-dajc-line py-10">
          <div className="space-y-4 text-left text-[15px] leading-relaxed text-dajc-muted sm:text-base">
            {storyParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <a
            href="https://www.dajc.eu/news/platform/why-dajc-exists/"
            className="mt-6 inline-block font-mono text-xs tracking-[0.06em] text-dajc-orange uppercase hover:underline"
          >
            Přečíst celý příběh DAJC &rarr;
          </a>
        </div>

        <a
          href="https://www.dajc.eu/"
          className="mt-12 inline-flex items-center justify-center rounded-full bg-dajc-orange px-8 py-4 text-lg font-semibold text-dajc-dark transition hover:brightness-110"
        >
          Navštívit dajc.eu
        </a>

        <nav
          aria-label="Related DAJC links"
          className="mt-8 flex items-center gap-3 font-mono text-xs tracking-[0.06em] text-dajc-orange uppercase"
        >
          <a href="https://www.dajc.eu/news/" className="hover:underline">
            Novinky
          </a>
          <span className="text-dajc-line" aria-hidden="true">
            &middot;
          </span>
          <a href="https://www.dajc.eu/partners/" className="hover:underline">
            Integrační ekosystém
          </a>
        </nav>
      </main>

      <footer className="relative z-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-6 pb-10 text-center font-mono text-[11px] tracking-[0.06em] text-dajc-navy">
        <span>DAJC</span>
        <span className="text-dajc-line" aria-hidden="true">
          &middot;
        </span>
        <span>European Heavy &amp; Oversized Transport Platform</span>
        <span className="text-dajc-line" aria-hidden="true">
          &middot;
        </span>
        <a href="https://www.dajc.eu/" className="hover:underline">
          dajc.eu
        </a>
      </footer>
    </div>
  );
}
