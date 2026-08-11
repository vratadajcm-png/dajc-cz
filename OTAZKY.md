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
