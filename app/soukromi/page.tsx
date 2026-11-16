import type { Metadata } from "next";
export const metadata:Metadata={
  title:"Ochrana osobních údajů | DAJC.cz",
  description:"České informace o zpracování registrací k testování a odpovědí z průzkumu DAJC Platform a TAR.",
  alternates:{canonical:"https://www.dajc.cz/soukromi"},
};
export default function Soukromi(){
  return <main className="relative z-10 mx-auto max-w-4xl px-5 py-16">
    <p className="font-mono text-xs uppercase tracking-wider text-dajc-orange">DAJC · osobní údaje</p>
    <h1 className="mt-4 text-4xl font-semibold">Ochrana osobních údajů na DAJC.cz</h1>
    <p className="mt-6 leading-relaxed text-dajc-muted">Český web provozuje projekt DAJC založený Miroslavem Dajčem. Pro dotazy, uplatnění práv nebo žádosti o opravu či výmaz údajů napište na <a className="text-dajc-orange underline" href="mailto:team@dajc.eu">team@dajc.eu</a>.</p>
    <section className="mt-10 border-t border-dajc-line pt-7"><h2 className="text-2xl font-semibold">Registrace k testování Platform</h2>
      <p className="mt-3 leading-relaxed text-dajc-muted">Český formulář odesílá údaje přes rozhraní DAJC.eu týmu DAJC: jméno, firmu, pracovní e-mail, zemi, profesní role a dobrovolně uvedené provozní informace. Slouží pouze pro organizaci předprodukčního testování a komunikaci k účasti. Nejde o marketingové předplatné ani objednávku. Doručení může zajišťovat Resend a registrace spravovat tým v e-mailové schránce.</p>
    </section>
    <section className="mt-10 border-t border-dajc-line pt-7"><h2 className="text-2xl font-semibold">Průzkum Platform a TAR</h2>
      <p className="mt-3 leading-relaxed text-dajc-muted">Dotazníky zjišťují profesní roli, firmu, zemi, používané nástroje, provozní problémy a prioritní funkce. Odpovědi jsou vedené odděleně podle produktu v přístupově omezené databázi DAJC na Neonu. Kontakt je dobrovolný a následná komunikace vyžaduje zvláštní souhlas. Výzkumné odpovědi se běžně uchovávají nejdéle 12 měsíců, pokud není právní důvod pro jinou dobu. Nevyplňujte osobní údaje zákazníků nebo účastníků zásahů.</p>
    </section>
    <section className="mt-10 border-t border-dajc-line pt-7"><h2 className="text-2xl font-semibold">Provoz webu a demo</h2>
      <p className="mt-3 leading-relaxed text-dajc-muted">Web je hostován na Vercelu, který zpracovává technické údaje potřebné k jeho provozu a zabezpečení. Veřejné demo používá syntetická data; nevkládejte do něj reálné dokumenty ani citlivé údaje.</p>
    </section>
    <p className="mt-10 rounded-lg border border-dajc-orange/40 p-5 leading-relaxed text-dajc-muted">Toto je český přehled pro orientaci. Podrobné informace, právní důvody zpracování a práva subjektů údajů jsou popsány v <a className="text-dajc-orange underline" href="https://www.dajc.eu/privacy" hrefLang="en">úplných zásadách DAJC.eu (anglicky)</a>, které pokrývají i DAJC.cz.</p>
  </main>;
}
