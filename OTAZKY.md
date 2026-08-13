# Otevřené otázky

## Otevřeno: `enabled` flag v `data/oversize-news-sources.json` je mrtvý kód

Pole `enabled` existuje u všech 134 zdrojů v registru a je u úplně všech
nastaveno na `false` (pozůstatek fáze 1 auditu), ale žádný skript
(`read-feeds.mjs`, `generate-test-card.mjs`) ho při výběru zdrojů nečte —
filtruje se jen podle `type === "rss" || "atom"`. Nastavení `enabled: false`
tedy v praxi zdroj z generování nijak nevyřazuje.

Zjištěno 2026-08-11 při řešení zdroje `sk-nds` (opakovaně servíroval
zastaralý/irelevantní obsah s vadným `pubDate` — viz commit odstraňující
`sk-nds` z registru). `sk-nds` byl smazán z registru přímo, ne přes
`enabled`, protože flag by stejně nic nezměnil.

Než se filtr na `enabled` reálně zapojí do `read-feeds.mjs`/
`generate-test-card.mjs`, je potřeba projít všech 134 zdrojů a rozhodnout
per zdroj, jestli má být `enabled: true` — jinak by zapojení filtru bez
přípravy vynulovalo počet kandidátů na 0 (žádný zdroj aktuálně `true`) a
zastavilo by páteční automatizaci úplně. Samostatný úkol, mimo rozsah
opravy `sk-nds`.

## Zjištěno: sk-nds servíroval ~10 let starý obsah jako aktuální (vizuálně ověřeno) — a stejný zdrojový odkaz je STÁLE v živém článku

Doplnění k odstranění `sk-nds` z registru (viz commit
`23c67370c13e345ae35565c8da3dd5ad4f6810f6` a bod o mrtvém `enabled` flagu
výše) — konkrétní důkaz, proč nešlo o drobný posun v datech, ale o
systémový problém s `pubDate` u tohoto zdroje:

Uživatel vizuálně ověřil tiskovou zprávu
`https://ndsas.sk/press/spravy/odstartovali-sme-vystavbu-kysuckej-dialnice`
("Začala výstavba diaľnice D3 na Kysuciach") — na fotografii ze zprávy je
čitelné datum na základním kameni stavby: **24. ledna 2017**. Feed ji ale
servíroval s `pubDate` vypadajícím jako aktuální (proto prošla přes
freshness filtr při generování). Jde tedy o obsah starý téměř 10 let,
prezentovaný jako čerstvý — potvrzuje to systémovou nespolehlivost
`pubDate` u `sk-nds`, ne izolovanou chybu.

**DŮLEŽITÉ — týká se živého obsahu:** tenhle přesný zdrojový odkaz je
zdrojem tématu "Začala výstavba diaľnice D3 na Kysuciach", které zůstalo
(jako jediné SK téma) v aktuálně publikovaném
`content/articles/2026-08-10-tydenni-prehled.json` — bylo vyhodnoceno
jako legitimní, protože text tématu (title/body/impact) neobsahuje žádný
čtyřciferný rok (`validateNoStaleYears` ho tedy nezachytila) a obsahově
nejde o osobní vozidlo/turistiku/trestní věc (`validateRelevance` ho
taky nezachytila). Zjištěno 2026-08-11, po komitu, který `sk-nds` z
registru odstranil — živý článek byl opraven 2026-08-13 (commit
`bb1b6fe`).

**Potvrzeno 2026-08-13 — chyba je aktivní systémová vlastnost CMS, ne
izolovaná historická anomálie:** uživatel navrhl `https://ndsas.sk/aktuality`
jako možnou alternativní cestu ke stejným datům. Diagnostický průzkum
(přímé HTTP/curl ověření, bez API nákladů) ukázal:

- `/aktuality` má vlastní `<link rel="alternate" type="application/atom+xml">`
  autodiscovery, který ukazuje přesně na `https://ndsas.sk/feed` — tedy na
  TENTÝŽ feed jako vyřazený `sk-nds`, ne na nezávislý kanál s jinou
  spolehlivostí.
- Každá stránka jednotlivého článku nese strukturovaná data (JSON-LD) s
  `datePublished` (skutečné datum vzniku) a `dateModified`. U všech 5
  nezávisle ověřených článků (včetně
  `odstartovali-sme-vystavbu-kysuckej-dialnice`, kde JSON-LD potvrzuje
  `datePublished: 2017-01-24` — přesně sedí s fotograficky ověřeným datem)
  je `dateModified` shodně `2026-08-13` (den ověření), bez ohledu na to,
  jestli `datePublished` je 2017, 2024, nebo pár dní staré.
- `pubDate` ve `/feed` odpovídá `dateModified`, ne `datePublished` — feed
  proto opakovaně servíruje i roky starý obsah s "čerstvým" datem, a
  nejde o jednorázový úlet: D3/Kysuce článek měl znovu dnešní `pubDate`
  i hodiny po ranní opravě živého článku.
- `/aktuality` jako HTML výpis není bezpečná alternativa k feedu ani sama
  o sobě — `nds-varuje-pred-podvodnymi-spravami` (skutečné
  `datePublished: 2024-04-10`, přes 2 roky staré) se objevuje přímo na
  první stránce výpisu jako zdánlivě aktuální položka.

**Rozhodnutí uživatele 2026-08-13:** nepřidávat `https://ndsas.sk/aktuality`
ani žádnou jinou cestu na `ndsas.sk` do registru — je to technicky stejný
zdroj dat jako vyřazený `sk-nds`, jen jiná prezentace téže systémové
chyby (`dateModified` se dotýká všeho obsahu bez ohledu na skutečnou
změnu). Platí, dokud NDS/CMS chybu neopraví.

## Vyřešeno: náhradní SK zdroj za sk-nds — cesmad.sk a cdb.sk prověřeny, žádný nepřidán

Ověřeno 2026-08-11 stejnou metodou jako ostatní položky registru (reálné
HTTP ověření přes curl, ne odhad):

**`cdb.sk` (Cestná databanka, Slovenská správa ciest) — zamítnuto.**
Skutečný RSS 2.0 feed existuje (`https://www.cdb.sk/rss.ashx?c=308420`,
nalezen přes `<link rel="alternate">` na homepage), technicky funkční,
validní `pubDate`. Obsah je ale mimo profil webu — jde o technický/
geodatový portál a feed obsahuje jen administrativní oznámení o vlastní
databázi ("Stav aktualizácie 2026", "Aktualizácia údajov CTEPK - 2026",
"PF 2026" = novoroční přání), ne dopravní zpravodajství. Frekvence navíc
jen ~2-4 položky ročně — nepoužitelné pro týdenní pipeline i kdyby byl
obsah relevantní.

**`cesmad.sk` (ČESMAD Slovakia, sdružení dopravců) — obsahově nejlepší
SK kandidát, který jsme zatím auditovali, ale NEPŘIDÁN kvůli členskému
paywallu.** Žádný RSS/Atom feed (vyžadovalo by `type: "html-list"`).
Skutečná news sekce: `https://cesmad.sk/novinky-a-aktuality` →
`https://cesmad.sk/kategoria/25-aktuality-2/...`. Titulky přesně na
profil webu — např. "Dočasné dopravné obmedzenia pre vozidlá nad 12 t v
Bulharsku", "Dodatočné letné zákazy jázd na diaľnici A10 Tauern v
Rakúsku", "Dočasná výnimka z pravidiel o časoch jazdy a odpočinku vo
Francúzsku". Data na listing stránce vypadají spolehlivě čerstvá
(30.06.–07.08.2026 ke dni ověření 11.08.2026), žádná stopa po sk-nds
bugu s falešně čerstvým `pubDate`.

Zásadní blokátor: **plný text každého článku je za přihlášením**
(ověřeno na 2 článcích, `302 → /user/login`, listing navíc zobrazuje
ikonu zámku vedle data). Veřejně dostupný je jen listing — titulek,
datum, cca 1-2větný excerpt, zdroj. Rozhodnutí, jestli pravidelně
strojově číst i jen tenhle veřejný listing web sdružení, jehož byznys
model je členský obsah, je otázka legitimity použití, ne technické
proveditelnosti.

**Rozhodnutí uživatele:** nepřidávat ani jeden zdroj teď. Registr
zůstává bez náhradního SK zdroje za `sk-nds`, dokud se nenajde čistší
alternativa nebo dokud uživatel sám neosloví ČESMAD kvůli svolení k
použití obsahu.

## Otevřeno: homografy v KEYWORDS/CARGO_OVERRIDE_PHRASES (generate-test-card.mjs)

Zjištěno 2026-08-11 při opravě substring kolizí (word-boundary matching
fix). Word-boundary přístup řeší kolize typu "oprav" uvnitř "doprava"
(substring problém), ale NEŘEŠÍ skutečné homografy - stejné celé slovo s
jiným významem v jiném jazyce:

- `KEYWORDS: "most "` (w=3, CZ/SK "most" = most/bridge) je zároveň běžné
  anglické slovo "most" (superlativ, "most drivers"). Registr má reálné
  UK/IE zdroje.
- `KEYWORDS: "toll"` (w=3, EN "toll" = mýtné) je zároveň běžné německé
  hovorové adjektivum "toll" (skvělý). Registr má reálné DE/AT/CH/LI
  zdroje. Skutečné německé slovo pro mýtné je "Maut".
- `CARGO_OVERRIDE_PHRASES`: slovenský tvar "nákladná" (nákladná doprava =
  cargo transport) je po normalize() identický s českým "nákladná"
  (costly, žensky rod) - `nakladna`. Proto override list obsahuje jen
  bezpečné české tvary "nákladní" (nakladni/nakladniho/nakladnim/
  nakladnich/nakladnimi), NE ženský/rodový tvar - malá ztráta recall pro
  slovenské "nákladná doprava" zprávy.

Řešení vyžaduje jazykově-aware scoring (napojit KEYWORDS/CARGO_OVERRIDE_PHRASES
na candidate.country, aby se "most"/"toll" vyhodnocovaly jinak podle zdrojové
země) - strukturální změna nad rámec word-boundary opravy z 2026-08-11.

## Zjištěno: `translate-article.mjs` při opravě článku přegeneruje všechny překlady znovu, ne jen diff

Zjištěno 2026-08-13 při opravě `content/articles/2026-08-10-tydenni-prehled.json`
(odstranění zastaralého SK tématu ze zdroje `sk-nds`, viz výše). Skript
nedrží stav "co už bylo přeloženo" ani neumí přeložit jen změněná témata -
při každém spuštění pošle DeepL znovu úplně všechen překladatelný text
článku (`buildTranslationPlan`) a přepíše celé pole `translations`.

Důsledek: i nezměněná témata (v tomto případě Via Lietuva bulletin a
oznámení ARRSH o mostech skupiny B1) dostala při opravném běhu drobně
jinak formulovaný překlad v ES/NL/RO - DeepL nevrací identický výstup na
identický vstup při opakovaném volání. Věcně to obsah nemění (stejná
fakta, jen jiná slovní formulace), takže to neprošlo žádnou validací jako
chyba.

Stojí za zvážení do budoucna: `translate-article.mjs` by mohl překládat
jen témata/pole, která se od posledního uloženého `translations` skutečně
změnila (např. porovnáním s předchozí verzí souboru), místo aby vždy
přepsal všechno - ušetřilo by to DeepL znaky i eliminovalo tenhle
kosmetický side-effect. Mimo rozsah aktuální opravy, samostatný úkol.

## Vyřešeno: obsahová pravidla pro `Article.checklist`

Rozhodnuto a implementováno (`scripts/generate-weekly-article.mjs`,
`generateChecklist`): checklist generuje AI třetím Claude API voláním z
CELÉHO obsahu článku (všech již vygenerovaných témat najednou), ne
nezávisle a ne po jednom tématu. Obsahem jsou akční připomínky/to-do nad
rámec jednotlivých zpráv (např. "od pondělí platí nový zákaz jízd v
Rakousku"), ne prostý výčet nadpisů témat.

Vazba na `topics` (dřív v kódu chyběla): AI u každé položky checklistu
uvádí `topicIndices` — 0-based indexy do pole témat, ze kterých položka
vychází. Skript po odpovědi ověří platnost indexů a nevalidní položky
zahodí s varováním do konzole; do výsledného `article.checklist` (prosté
`string[]`, schéma/rendering beze změny) se `topicIndices` neukládají,
slouží jen jako runtime kontrola groundingu. Prázdný výsledek → pole
`checklist` se v článku vynechá.

`validate-article.mjs` zůstává beze změny (žádná nová blokující kontrola
pro checklist) — MVP rozhodnutí, zahazování nevalidních položek řeší
generation-time kontrola výše.
