# Otevřené otázky

Aktuálně žádné.

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
