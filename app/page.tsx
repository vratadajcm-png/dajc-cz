import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DAJC.cz | Koordinace nadrozměrné dopravy a odtahových služeb",
  description: "DAJC Platform propojuje těžkou a nadrozměrnou přepravu. DAJC TAR spojuje odtah, asistenci a vyproštění. Dva produkty ve vývoji, české informace a registrace k testování 2027.",
  alternates: { canonical: "https://www.dajc.cz/", languages: { "cs-CZ": "https://www.dajc.cz/", en: "https://www.dajc.eu/" } },
};

const products = [
  { name: "DAJC Platform", href: "/platform", subtitle: "Těžká a nadrozměrná přeprava", summary: "Jeden koordinovaný proces D-ID propojuje zadavatele, dopravce, trasy, povolení, dokumenty a řidiče. Bez nutnosti nahrazovat stávající software.", status: "Ve vývoji · testování plánováno na 3. čtvrtletí 2027", action: "Prozkoumat Platform" },
  { name: "DAJC TAR", href: "/tar", subtitle: "Odtah · Asistence · Vyproštění", summary: "Jeden Recovery Passport pro příjem události, dispečink, techniky, partnerskou síť, dokumentaci a vyúčtování zásahu.", status: "Ve vývoji · nejde o dostupnou asistenční službu", action: "Prozkoumat TAR" },
];
export default function Home() {
  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-20">
      <section className="py-16 sm:py-24">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-dajc-orange">Evropská koordinace dopravy a zásahů</p>
        <h1 className="mt-5 max-w-4xl font-heading text-4xl font-bold leading-tight sm:text-6xl">Méně roztříštěnosti. <span className="text-dajc-orange">Jasnější koordinace.</span></h1>
        <p className="mt-7 max-w-3xl text-lg leading-relaxed text-dajc-muted">DAJC vyvíjí dvě samostatná řešení: Platform pro těžkou a nadrozměrnou přepravu a TAR pro odtahové, asistenční a vyprošťovací provozy. Naším cílem je propojit lidi a jejich stávající systémy, ne je nahrazovat.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/testovani" className="rounded-lg bg-dajc-orange px-6 py-3 font-semibold text-dajc-dark hover:brightness-110">Registrace k testování Platform</Link>
          <Link href="/tar#pruzkum" className="rounded-lg border border-dajc-orange px-6 py-3 font-semibold text-dajc-orange hover:bg-dajc-navy">Pomoci s průzkumem TAR</Link>
          <Link href="/demo" className="rounded-lg border border-dajc-line px-6 py-3 font-semibold hover:border-dajc-orange">Průvodce ukázkou</Link>
        </div>
        <p className="mt-5 text-sm text-dajc-muted">Platform: plánované předprodukční testování červenec–září 2027, přesné datum není potvrzeno. TAR: vývoj a průzkum trhu, žádná živá služba.</p>
      </section>
      <section aria-labelledby="products-title" className="border-t border-dajc-line py-12">
        <h2 id="products-title" className="font-heading text-3xl font-semibold">Dva produkty, dvě oblasti provozu</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">{products.map(p => <article key={p.name} className="flex flex-col rounded-xl border border-dajc-line bg-dajc-navy/20 p-7">
          <p className="text-sm font-medium text-dajc-orange">{p.subtitle}</p>
          <h3 className="mt-3 text-3xl font-semibold">{p.name}</h3>
          <p className="mt-5 flex-1 leading-relaxed text-dajc-muted">{p.summary}</p>
          <p className="mt-6 text-xs text-dajc-muted">{p.status}</p>
          <Link href={p.href} className="mt-5 inline-flex w-fit rounded-lg border border-dajc-orange px-5 py-3 font-semibold text-dajc-orange hover:bg-dajc-orange hover:text-dajc-dark">{p.action} →</Link>
        </article>)}</div>
      </section>
      <section aria-labelledby="example-title" className="border-t border-dajc-line py-12">
        <p className="font-mono text-xs uppercase tracking-wider text-dajc-orange">Ukázka zamýšlených procesů</p>
        <h2 id="example-title" className="mt-2 text-3xl font-semibold">Od první informace až po doložený výsledek</h2>
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-dajc-line p-6"><h3 className="font-semibold">D-ID · Platform</h3><p className="mt-3 leading-relaxed text-dajc-muted">Poptávka → náklad → trasa a povolení → schválené provedení → předání a vyúčtování.</p></div>
          <div className="rounded-lg border border-dajc-line p-6"><h3 className="font-semibold">Recovery Passport · TAR</h3><p className="mt-3 leading-relaxed text-dajc-muted">Nahlášení → přidělení techniky → práce na místě → dokumentace → uzavření případu.</p></div>
        </div>
        <p className="mt-4 text-sm text-dajc-muted">Jde o navrhované workflow, nikoli důkaz hotových integrací, úředního schvalování či nasazené asistenční sítě.</p>
      </section>
      <section aria-labelledby="trust-title" className="border-t border-dajc-line py-12">
        <h2 id="trust-title" className="text-3xl font-semibold">Proč vzniká DAJC</h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-dajc-muted">Projekt založil Miroslav Dajč na základě zkušeností z provozu těžké a nadrozměrné dopravy a odtahové techniky. DAJC je provider-neutral: specializované systémy, odpovědnosti a rozhodnutí mají zůstat tam, kde dnes patří.</p>
        <div className="mt-5 flex flex-wrap gap-5 text-dajc-orange"><Link href="/faq">Časté otázky →</Link><Link href="/aktuality">Aktuality →</Link><Link href="/kontakt">Kontakt →</Link></div>
      </section>
    </main>
  );
}
