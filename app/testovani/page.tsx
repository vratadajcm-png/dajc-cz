import type { Metadata } from "next";
import TestingForm from "../components/TestingForm";
export const metadata:Metadata={
  title:"Testování DAJC Platform – 3. čtvrtletí 2027",
  description:"Česká registrace k předprodukčnímu testování DAJC Platform plánovanému na červenec až září 2027. Přesný termín zatím není potvrzen.",
  alternates:{canonical:"https://www.dajc.cz/testovani",languages:{"cs-CZ":"https://www.dajc.cz/testovani",en:"https://www.dajc.eu/testing"}},
};
export default function Testovani(){
  return <main className="relative z-10 mx-auto max-w-4xl px-5 py-16">
    <p className="font-mono text-xs uppercase tracking-wider text-dajc-orange">DAJC Platform · registrace otevřená</p>
    <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">Předprodukční testování ve 3. čtvrtletí 2027</h1>
    <p className="mt-6 leading-relaxed text-dajc-muted">Testování se plánuje na červenec až září 2027. Přesný den začátku ještě není potvrzen. Dříve zveřejněný termín 4. ledna 2027 již neplatí (harmonogram aktualizován 27. října 2026).</p>
    <p className="mt-4 leading-relaxed text-dajc-muted">Registrace je určená dopravcům, dispečerům, řidičům, zadavatelům, doprovodům a specialistům. Budou ověřovat vyvíjený produkt, nikoli samostatnou pilotní nebo Early Access edici. Registrace neznamená okamžitý přístup ani komerční službu.</p>
    <section className="mt-12 border-t border-dajc-line pt-8" aria-labelledby="registration-title">
      <h2 id="registration-title" className="text-3xl font-semibold">Registrace v češtině</h2>
      <p className="mt-4 text-sm leading-relaxed text-dajc-muted">Vyplňte svou roli a kontaktní údaje. Nevkládejte dokumenty zákazníků, přístupová hesla ani citlivé osobní informace.</p>
      <TestingForm/>
    </section>
  </main>;
}
