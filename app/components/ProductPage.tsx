import Link from "next/link";
import ResearchForm from "./ResearchForm";
type Product = "platform" | "tar";
const content = {
  platform: {
    kicker: "DAJC PLATFORM · TĚŽKÁ A NADROZMĚRNÁ PŘEPRAVA",
    title: "Jedna přeprava. Všichni účastníci ve stejném kontextu.",
    intro: "Provozní koordinace od první poptávky přes náklad, vhodnou soupravu, trasu a povolení až po předání a vyúčtování. Každá přeprava dostává identitu D-ID. DAJC nenahrazuje TMS, ERP ani specializované aplikace.",
    status: "Produkt ve vývoji · předprodukční testování plánováno na 3. čtvrtletí 2027.",
    old: "Změna termínu nakládky dorazí e-mailem, zatímco dopravce, doprovod a specialista na povolení mohou pracovat s rozdílnými verzemi dokumentů.",
    next: "D-ID by měl propojit potvrzenou změnu s příslušnými úseky trasy, požadavky povolení, účastníky a dokumentací tak, aby všichni pracovali se správnou verzí.",
    steps: ["Poptávka a náklad", "Technické parametry", "Trasy a povolení", "Realizace a doklady", "Předání a fakturace"],
    advantages: ["Jedno D-ID pro přepravu a zúčastněné firmy", "Trasy, omezení a povolení ve společném kontextu", "Dispečink, řidiči, dokumenty a závady", "Vazba na existující TMS, telematiku a další nástroje"],
    safety: "Povolovací rozhodnutí činí příslušné orgány; žádný popis nepředstavuje garantované automatické schválení.",
  },
  tar: {
    kicker: "DAJC TAR · ODTÁHOVÉ, ASISTENČNÍ A VYPROŠŤOVACÍ SLUŽBY",
    title: "Jeden zásah. Jedna přehledná dokumentace případu.",
    intro: "DAJC TAR je připravovaný společný produkt pro odtah, asistenční zásahy a vyprošťování. Recovery Passport má propojit příjem zakázky, dispečink smíšené flotily, techniky, partnery, fotografie, předání a vyúčtování.",
    status: "Produkt ve vývoji a průzkumu trhu · nejde o živou odtahovou ani asistenční službu.",
    old: "Při vyprošťování těžkého vozidla vznikají oddělené hovory, fotografie, pokyny asistence, podklady pro dispečink a položky vícenákladů.",
    next: "Recovery Passport by měl propojit původní hlášení, přidělenou posádku, technické poznámky, doložené úkony, komunikaci s partnery a následné vyúčtování.",
    steps: ["Příjem události", "Výběr vozidla a techniků", "Zásah na místě", "Evidence a předání", "Uzavření a vyúčtování"],
    advantages: ["Jednotný dispečink pro lehký i těžký odtah", "Průběžná dokumentace zásahu a fotografie", "Předávání případů uvnitř partnerské sítě", "Výkaz práce a podklady pro fakturaci"],
    safety: "Bezpečnost zásahu, nároky z asistenčních smluv a oprávnění poskytovatelů zůstávají jejich odpovědností.",
  },
};
export default function ProductPage({ product }: { product: Product }) {
  const item = content[product];
  return <main className="relative z-10 mx-auto max-w-6xl px-5 py-14">
    <p className="font-mono text-xs uppercase tracking-[0.15em] text-dajc-orange">{item.kicker}</p>
    <h1 className="mt-5 max-w-4xl font-heading text-4xl font-bold leading-tight sm:text-5xl">{item.title}</h1>
    <p className="mt-6 max-w-4xl text-lg leading-relaxed text-dajc-muted">{item.intro}</p>
    <p className="mt-5 rounded border-l-2 border-dajc-orange pl-4 text-sm text-dajc-muted">{item.status}</p>
    <div className="mt-7 flex flex-wrap gap-3">
      {product === "platform" ? <Link className="rounded-lg bg-dajc-orange px-5 py-3 font-semibold text-dajc-dark" href="/testovani">Registrace k testování Platform</Link> : <a className="rounded-lg bg-dajc-orange px-5 py-3 font-semibold text-dajc-dark" href="#pruzkum">Vyplnit průzkum TAR</a>}
      <a className="rounded-lg border border-dajc-orange px-5 py-3 text-dajc-orange" href={product === "platform" ? "https://www.dajc.eu/platform/integrations" : "https://www.dajc.eu/tar/integrations"} hrefLang="en">Technické integrace (EN) →</a>
      {product === "platform" && <Link href="/demo" className="rounded-lg border border-dajc-line px-5 py-3">Průvodce demem</Link>}
    </div>
    <section className="mt-16 border-t border-dajc-line pt-9" aria-labelledby="comparison-title"><h2 id="comparison-title" className="text-3xl font-semibold">Co se v provozu mění</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2"><article className="rounded-xl border border-dajc-line p-6"><h3 className="font-semibold text-dajc-muted">Dnes</h3><p className="mt-3 leading-relaxed text-dajc-muted">{item.old}</p></article><article className="rounded-xl border border-dajc-orange/40 bg-dajc-navy/20 p-6"><h3 className="font-semibold text-dajc-orange">Zamýšlené řešení DAJC</h3><p className="mt-3 leading-relaxed text-dajc-muted">{item.next}</p></article></div>
    </section>
    <section className="mt-14 border-t border-dajc-line pt-9"><h2 className="text-3xl font-semibold">Jeden proces od začátku do konce</h2>
      <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{item.steps.map((step,i)=><li key={step} className="rounded border-t-2 border-dajc-orange bg-dajc-navy/20 p-4"><span className="font-mono text-xs text-dajc-orange">{String(i+1).padStart(2,"0")}</span><p className="mt-2 text-sm font-medium">{step}</p></li>)}</ol>
      <p className="mt-5 text-sm text-dajc-muted">{item.safety}</p>
    </section>
    <section className="mt-14 border-t border-dajc-line pt-9"><h2 className="text-3xl font-semibold">Hlavní připravované funkce</h2><ul className="mt-6 grid gap-3 md:grid-cols-2">{item.advantages.map(s=><li key={s} className="rounded-lg border border-dajc-line p-4 text-dajc-muted">✓ {s}</li>)}</ul><p className="mt-5 text-sm text-dajc-muted">Zatím jde o produktový plán, nikoli potvrzení nasazení nebo dostupnosti jednotlivých integrací.</p></section>
    <section id="pruzkum" className="mt-14 scroll-mt-8 border-t border-dajc-line pt-9"><h2 className="text-3xl font-semibold">Pomozte ověřit, co má smysl vyvíjet</h2><p className="mt-4 max-w-3xl leading-relaxed text-dajc-muted">Průzkum je určený odborníkům z praxe. Neslouží jako objednávka, smlouva ani registrace k testování. Neuvádějte osobní údaje svých zákazníků, řidičů ani účastníků událostí.</p><ResearchForm product={product}/></section>
  </main>;
}
