type Feature = { title: string; description: string; note?: string };
type Group = { title: string; summary: string; features: Feature[] };
type Product = "platform" | "tar";
const f = (title: string, description: string, note?: string): Feature => ({ title, description, note });

const platform: Group[] = [
  {
    title: "Poptávka, obchod a řízení přepravy",
    summary: "Jedna ověřitelná zakázka od prvního kontaktu až po uzavření, bez ztráty vazeb na systémy jednotlivých firem.",
    features: [
      f("D-ID: jednotná identita přepravy", "Propojí údaje o nákladu, vozidlech, trase, účastnících, dokumentech, rozhodnutích a milnících do jednoho kontextu. Změny mají svého autora, verzi a odpovědnost.", "Vlastní čísla objednávek v TMS a u zákazníka zůstávají zachována."),
      f("Poptávka, technické upřesnění a nabídka", "Zadavatel předá parametry nákladu a požadavky. Dopravce může doplnit technické otázky, návrh řešení, cenu, revize nabídky i přijetí zakázky. Následuje řízené uzamčení zadání."),
      f("Smlouvy, dokumenty a platební podmínky", "Před aktivací se kontrolují schválené podmínky, potřebné dokumenty, výjimky a ověření zálohy. Model 70/30 lze použít tam, kde je sjednán.", "DAJC nemá vydávat neověřený bankovní převod za přijatou platbu; skutečnou transakci zpracuje poskytovatel plateb."),
      f("Schvalování změn a auditní stopa", "Změna termínu, trasy nebo soupravy vyvolá aktualizaci dotčených podkladů a potvrzení oprávněnými účastníky. Je dohledatelné, kdo rozhodl a z jakého zdroje vycházel."),
      f("Role napříč firmami a pohled zákazníka", "Zadavatel, dopravce, dispečer, řidič, doprovod i povolovací specialista vidí pouze informace potřebné pro svoji roli. Zákazník může sledovat schválené milníky bez přístupu k interním nákladům dopravce."),
    ],
  },
  {
    title: "Povolení, předpisy a úřední podklady",
    summary: "Povolení tvoří součást konkrétní přepravy; DAJC je má koordinovat, nikoli nahrazovat příslušné úřady.",
    features: [
      f("Permit Hub pro jednotlivé země", "U každé jurisdikce eviduje požadavky, odpovědnou osobu, stav žádosti, podklady, platnost, omezení a podmínky vydaného povolení.", "Povolení uděluje vždy příslušný orgán nebo oprávněná instituce."),
      f("Historical Permit Matching", "Porovnává oprávněně dostupná dříve vydaná povolení s novým nákladem, konfigurací náprav, trasou a podmínkami. Upozorňuje na shody i podstatné rozdíly.", "Historické povolení samo o sobě neopravňuje k nové jízdě."),
      f("Automatizované vydání se souhlasem úřadu", "Tam, kde úřad umožní schválené digitální rozhraní, má systém připravit a podat strukturovanou žádost a převzít úředně vydaný výsledek. V ostatních případech zůstává běžný postup.", "DAJC nemá vlastní pravomoc vydávat nadrozměrná povolení."),
      f("Zákazy jízd a omezení pohybu", "Prověřuje hmotnostní kategorii, termín, státní svátky, časová okna, zvláštní omezení nadrozměrné dopravy a možné výjimky podle zdrojovaného registru.", "Neověřený nebo zastaralý údaj není potvrzením volného průjezdu."),
      f("Důvěryhodnost zdrojů a rozpory", "K pravidlu uchovává zdroj, jurisdikci, datum, platnost a úroveň ověření. Při rozporu mezi mapou, článkem a úředním předpisem vyžaduje dohledání rozhodného podkladu."),
    ],
  },
  {
    title: "Náklad, technika a plánování trasy",
    summary: "Technické parametry soupravy se posuzují společně s dostupností infrastruktury, povoleními a časovým plánem.",
    features: [
      f("Technický profil nákladu", "Rozměry, hmotnost, přepravní obálka, manipulační požadavky a dostupné informace o těžišti jsou evidovány u D-ID. Změna parametru může vyvolat nové posouzení trasy."),
      f("Tahače, návěsy a modulární sestavy", "Konfigurace vozidel, nápravových linií, příslušenství a kapacit se přiřazuje ke konkrétní zakázce včetně historie změn.", "Výrobní a technické limity určuje dokumentace výrobce a oprávněný odborník."),
      f("Trasa, průjezdné profily a mosty", "Kombinuje schválené rozměry vozidla, silniční omezení, nosnosti, světlé výšky a podmínky povolení. Případné konflikty vyžadují prověření ještě před realizací.", "Výsledek nenahrazuje potřebný průzkum trasy ani úřední souhlas."),
      f("Dopravní události a uzavírky", "Informace z povolených dopravních zdrojů, včetně DATEX II a národních přístupových bodů, mohou upozornit na událost na plánované trase a potřebu změny."),
      f("Doby řízení, odpočinek a vhodná stání", "Plánování propojí zákonné režimy řízení a odpočinku, časová okna přepravy a kandidátní parkovací místa pro skutečné rozměry soupravy.", "Za dodržení pravidel a reálné podmínky stání odpovídá dopravce."),
    ],
  },
  {
    title: "Dispečink, řidič a realizace",
    summary: "Schválené instrukce se dostanou k posádce a průběh přepravy se průkazně vrací dispečerovi i oprávněným partnerům.",
    features: [
      f("Dispečerský přehled a milníky", "Jedno pracovní místo může zobrazovat fázi D-ID, odpovědnou firmu, otevřené výjimky, potřebná potvrzení, nakládku, doprovod a termíny."),
      f("Aplikace řidiče a offline dokumenty", "Řidič má dostat schválené zadání, trasu, seznam povolení, kontrolní úkoly a dokumenty dostupné i při omezeném signálu. Změny se synchronizují kontrolovaně.", "Aplikace nenahrazuje zákonem vyžadované doklady ani schválenou navigaci."),
      f("Závady, incidenty a elektronická stazka", "Řidič může zaznamenat poruchu, poškození, fotografii či provozní událost u konkrétní soupravy a přepravy. Dispečer přidělí řešení a eviduje výsledek."),
      f("Stav přepravy a události z telematiky", "Při oprávněném propojení lze zobrazovat schválené milníky, polohové události a výjimky z externích telematických systémů. Podrobnost údajů se řídí rolí účastníka."),
      f("Předání, e-CMR/eFTI a závěrečné vyúčtování", "Potvrzení dodání, fotografie, podpisy, poškození, vícenáklady a odpovídající elektronické dokumenty se propojí se závěrečným finančním vypořádáním.", "Účetní a certifikované dokumentové systémy zůstávají zdrojem svých oficiálních záznamů."),
    ],
  },
  {
    title: "Propojení systémů a provozní inteligence",
    summary: "DAJC je neutrální koordinační vrstva nad stávajícími aplikacemi, nikoli povinná náhrada TMS, ERP nebo telematiky.",
    features: [
      f("Connector Hub a zachování stávajícího softwaru", "Řízené API, webhooky, EDI, souborové výměny nebo konektorové agenty mají přenášet pouze potřebné objednávky a události mezi schválenými systémy.", "Každá reálná integrace vyžaduje oprávnění, smluvní podmínky a technické ověření."),
      f("Propojení telematických platforem", "Vozidlové a provozní události od různých oprávněně připojených poskytovatelů se převádějí do společného kontextu D-ID. Původní portál spravuje zařízení a surová data."),
      f("Celnictví a přeshraniční dokumentace", "Tam, kde jsou relevantní, se k přepravě vážou reference NCTS, AES, ICS2, TIR či eTIR a důkazy o podání, nikoli nepodložené tvrzení o celním odbavení."),
      f("DAJC AI a dohledatelné odpovědi", "Samostatný asistent může pomáhat s vyhledáním předpisů, technických podkladů a chybějících informací. Výstup má být vysvětlitelný a ověřitelný.", "Rozhodnutí úřadu, dispečera ani odpovědného odborníka nesmí být nahrazeno automaticky."),
      f("Analytika oprávněných provozních dat", "Souhrn milníků, zdržení, opakovaných chyb a neúplné dokumentace může pomoci odhalovat úzká místa. Citlivé údaje jiných firem zůstávají oddělené."),
    ],
  },
];

const tar: Group[] = [
  {
    title: "Příjem události a společný případ",
    summary: "Jedno číslo zásahu spojuje původní objednávku, oprávnění, stav práce a výsledek.",
    features: [
      f("Recovery Passport a číslo události", "Jeden případ propojí čísla pojišťovny, asistenční organizace, odtahové firmy a technika s časovou osou, dokumenty a předáním vozidla."),
      f("Zakázky z telefonu, webu, e-mailu a API", "Dispečink má přijímat strukturované informace ze schválených partnerských rozhraní i z běžných kanálů. U záznamu je znám zdroj, poloha, vozidlo, popis závady a požadovaná pomoc."),
      f("Partner Hub a duplicitní hlášení", "Příjem objednávky, její přijetí poskytovatelem, změny a zrušení se sledují samostatně. Opakovaná hlášení se mají rozpoznat a přidružit ke správnému případu.", "Doručení dat neznamená potvrzení převzetí zakázky."),
      f("Oprávnění, krytí a souhlasy", "U případu lze zaznamenat, kdo odsouhlasil výkon, rozsah zásahu, cenové podmínky a změny zadání.", "Platnost asistence nebo pojistného krytí rozhoduje příslušná organizace."),
      f("Informace pro řidiče a zákazníka", "Pokud to poskytovatel dovolí, může klient předat polohu, typ vozidla a základní údaje a sledovat povolené milníky příjezdu a předání.", "DAJC TAR není tísňová linka ani aktuálně dostupná asistenční služba."),
    ],
  },
  {
    title: "Dispečink smíšené odtahové flotily",
    summary: "Lehká odtahovka, těžké vyprošťovací vozidlo i servisní dodávka patří do jedné provozní organizace.",
    features: [
      f("Jedna dispečerská nástěnka", "Přehled volných posádek, přijatých zakázek, výjezdů, zpoždění a kritických termínů bez oddělených evidencí pro lehký a těžký odtah."),
      f("Výběr vhodné techniky a posádky", "Požadavky případu se porovnají s nosností, navijákem, rotátorem nebo jeřábem, vybavením servisního vozu, kvalifikací a místními podmínkami.", "Konečné technické posouzení vždy přísluší kvalifikované obsluze."),
      f("Mobilní aplikace pro techniky a řidiče", "Úkol, schválená poloha, fotografie, kontrolní seznamy, stav zásahu a podpisy na mobilu či odolném tabletu; počítá se i s pracovním prostředím Zebra."),
      f("Subdodavatelé a partnerská síť", "Zakázka se může nabídnout oprávněnému partnerovi, který potvrdí přijetí, průběh a vrátí důkazy o vykonané práci. Vidí jen svůj povolený rozsah."),
      f("Příjezd, ETA a provozní milníky", "Oddělené stavy přijetí, přidělení, jízdy, příjezdu, nakládky, převozu a dokončení zjednoduší předávání informací.", "Odhad příjezdu není zárukou konkrétního času."),
    ],
  },
  {
    title: "Technické vyprošťování a bezpečnost",
    summary: "Technická dokumentace a bezpečnostní předpoklady mají být dohledatelné u konkrétního zásahu.",
    features: [
      f("Prvotní posouzení místa zásahu", "Přístup k vozidlu, jeho poloha, terén, překážky, počasí, dopravní rizika, fotografie a nezbytná technika tvoří základ pro rozhodnutí kvalifikované posádky."),
      f("Navijáky, převody, kotvy a stabilita", "Pracovní listy mohou dokumentovat vstupní hodnoty a kontrolované výpočty tahů, úhlů, převodů, kotevních bodů či stability.", "Hodnoty výrobce, odborné výpočty a místní bezpečnostní pravidla mají vždy přednost."),
      f("Bluetooth OBD-II a nápověda k závadám", "Při kompatibilním hardwaru lze přenést diagnostické kódy a využít licencované technické podklady výrobce s AI nápovědou k dalšímu postupu.", "Kompatibilita adaptéru, licence manuálů ani automatické odstranění závady nejsou garantovány."),
      f("Dopravní situace a meteorologická data", "Relevantní události DATEX II, uzavírky, výstrahy a dostupné meteorologické informace včetně zdrojů souvisejících s Meteosat mohou pomoci vyhodnotit podmínky."),
      f("Poloha, Galileo a navigace", "U místa zásahu se zachová zdroj souřadnic a jeho přesnost. Tam, kde to zařízení podporuje, lze využít polohové údaje systému Galileo a předat cíl vhodné navigaci.", "Satelitní poloha nezaručuje průjezdnost trasy pro těžkou techniku."),
    ],
  },
  {
    title: "Důkazy, dokumentace a předání vozidla",
    summary: "Zásah se dokumentuje jednou pro oprávněné účastníky, ne opakovaně pro každého partnera.",
    features: [
      f("Fotografie, video, úkony a podpisy", "Časově označené záznamy o stavu vozidla před a po zásahu, provedených úkonech, poškození a souhlasech se vážou k Recovery Passport."),
      f("Předání do úschovy, servisu nebo skladu", "Evidence místa, času, příjemce, stavu vozidla, inventáře a předaných klíčů při převozu nebo přechodu fyzické odpovědnosti."),
      f("Práce bez signálu a synchronizace", "Terénní aplikace má dočasně uchovat nezbytné údaje a při obnovení připojení je kontrolovaně odeslat, včetně řešení konfliktů.", "Neodeslaný záznam nesmí být označen jako převzatý dispečinkem."),
      f("Výstupy pro pojišťovny a partnery", "Z jednoho případu vznikají oprávněným příjemcům různé souhrny, důkazní balíčky a potvrzení o jejich předání. Osobní údaje a sazby podléhají přístupovým právům."),
    ],
  },
  {
    title: "Vyúčtování, kvalita a provozní přehled",
    summary: "Odvedená práce, souhlasy s vícenáklady a účetní uzávěrka vycházejí ze stejného doloženého případu.",
    features: [
      f("Automatický výkaz práce a vícenákladů", "Čas práce, čekání, najeté kilometry, skladování, další technika či specializované úkony jsou evidovány s podklady, sazbou a schválením.", "Systém nemá účtovat neodsouhlasené položky."),
      f("Fakturace a napojení účetnictví", "Uzavřený případ poskytne ověřené podklady pro fakturu a případné předání do stávajícího účetního systému. Finanční evidence zůstává u účetního poskytovatele."),
      f("Statistiky zásahů a partnerská kvalita", "Přehled typů zakázek, časů přijetí, reakce, výjezdů, výjimek a úplnosti dokumentace pomáhá vyhodnocovat provoz.", "Údaje jiné organizace nesmějí být bez oprávnění dostupné."),
      f("AI podpora s kontrolou člověka", "Nápověda může shrnout historii případu, upozornit na chybějící informace a pomoci vyhledat technický postup. Finální bezpečnostní a finanční rozhodnutí zůstává člověku."),
    ],
  },
];

export default function ProductCapabilityCatalogue({ product }: { product: Product }) {
  const groups = product === "platform" ? platform : tar;
  const total = groups.reduce((sum, group) => sum + group.features.length, 0);
  return (
    <section id="funkce" aria-labelledby="funkce-title" className="mt-16 scroll-mt-12 border-t border-dajc-line pt-10">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-dajc-orange">Kompletní návrh produktu</p>
      <h2 id="funkce-title" className="mt-3 max-w-4xl font-heading text-3xl font-semibold sm:text-4xl">Funkce a způsob jejich využití</h2>
      <p className="mt-4 max-w-4xl leading-relaxed text-dajc-muted">Projděte si všech {total} plánovaných funkcí v {groups.length} oblastech. Každá funkce popisuje zamýšlený výsledek; nejde o tvrzení, že již byla dodána nebo že je napojení dostupné v produkci.</p>
      <nav aria-label="Obsah produktových funkcí" className="mt-7 flex flex-wrap gap-2">
        {groups.map((group, index) => <a key={group.title} href={`#oblast-${index + 1}`} className="rounded-full border border-dajc-line px-3 py-2 text-sm text-dajc-orange hover:border-dajc-orange">{String(index + 1).padStart(2, "0")} · {group.title}</a>)}
      </nav>
      <div className="mt-8 space-y-5">
        {groups.map((group, index) => (
          <section id={`oblast-${index + 1}`} key={group.title} className="scroll-mt-24 rounded-xl border border-dajc-line bg-dajc-navy/20 p-5 sm:p-7">
            <div className="flex items-start gap-4">
              <span className="pt-1 font-mono text-sm text-dajc-orange">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-heading text-2xl font-semibold">{group.title}</h3>
                <p className="mt-2 max-w-3xl leading-relaxed text-dajc-muted">{group.summary}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {group.features.map((feature, item) => (
                <article key={feature.title} className="rounded-lg border border-dajc-line bg-dajc-dark/40 p-5">
                  <p className="font-mono text-xs text-dajc-orange">{index + 1}.{item + 1}</p>
                  <h4 className="mt-2 text-lg font-semibold">{feature.title}</h4>
                  <p className="mt-3 text-sm leading-relaxed text-dajc-muted">{feature.description}</p>
                  {feature.note && <p className="mt-3 border-l-2 border-dajc-orange pl-3 text-sm leading-relaxed text-dajc-muted">{feature.note}</p>}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
