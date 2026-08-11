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
