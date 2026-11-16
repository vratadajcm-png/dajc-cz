import type { Metadata } from "next";
import Link from "next/link";
export const metadata:Metadata={title:"Časté otázky | DAJC.cz",description:"Odpovědi na otázky k DAJC Platform, TAR, datům, integracím a testování v roce 2027.",alternates:{canonical:"https://www.dajc.cz/faq"}};
const questions=[
 ["Je DAJC Platform už dostupná?","Ne. Platform je ve vývoji. Předprodukční testování je plánováno na 3. čtvrtletí 2027, přesný termín zatím nebyl potvrzen. Registrace neznamená okamžitý přístup ani objednávku."],
 ["Co je DAJC TAR?","Jeden připravovaný produkt pro koordinaci odtahů, asistence a vyproštění. Služba zatím není komerčně dostupná a DAJC neprovozuje živý dispečink zásahů."],
 ["Bude DAJC další burza nákladů?","DAJC Platform není koncipována jako obecná burza nákladů. Má být neutrální koordinační vrstvou. Zamýšlené obchodní role budou vždy odlišeny od neutrálního softwaru."],
 ["Musím vyměnit stávající software?","Ne. Návrh počítá se zachováním TMS, ERP, telematiky a dalších zavedených systémů a s jejich autorizovaným propojením tam, kde bude technicky a smluvně možné."],
 ["Znamená demo, že fungují integrace nebo automatická povolení?","Ne. Veřejné demo používá syntetická data a ilustruje zamýšlené procesy. Zobrazené stavy a ovládací prvky nejsou důkazem živých propojení ani schválení ze strany úřadů."],
 ["Jak se mohu zapojit?","Pro Platform vyplňte registrační formulář na českém webu. Pro Platform i TAR lze vyplnit samostatné průzkumné dotazníky. Tyto činnosti nepředstavují placený pilot ani automatický nárok na přístup."],
 ["Kde jsou podrobné integrační informace?","Obecná architektura je veřejně popsána na DAJC.eu. Uvedení názvu určitého poskytovatele neznamená uzavřené partnerství, schválenou integraci ani povolení sdílet data."],
];
export default function Faq(){return <main className="relative z-10 mx-auto max-w-4xl px-5 py-16"><p className="font-mono text-xs tracking-wider text-dajc-orange">DAJC · FAQ</p><h1 className="mt-4 text-4xl font-semibold">Časté otázky</h1><div className="mt-10 space-y-3">{questions.map(([q,a])=><details key={q} className="group rounded-lg border border-dajc-line p-5"><summary className="cursor-pointer font-semibold text-dajc-white marker:text-dajc-orange">{q}</summary><p className="mt-4 leading-relaxed text-dajc-muted">{a}</p></details>)}</div><div className="mt-9 flex gap-5 text-dajc-orange"><Link href="/testovani">Testování Platform →</Link><Link href="/kontakt">Kontakt →</Link></div></main>;}
