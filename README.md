# dajc.cz

Jednoduchá odkazová landing page pro **DAJC**. Jediný cíl: krátce
představit DAJC a poslat návštěvníka na hlavní web
[dajc.eu](https://www.dajc.eu/). Jedna statická stránka — žádná databáze,
žádný blog, žádný News systém, žádná uživatelská logika, žádná vlastní
aplikační funkčnost, žádná duplicita obsahu z dajc.eu.

> **Toto je oddělený projekt od hlavního aplikačního repozitáře DAJC.**
> Neobsahuje a nesmí obsahovat žádnou závislost na kódu hlavní aplikace ani
> sdílená npm workspaces — jde o samostatný git repozitář nasazovaný
> nezávisle.

## Stack

- Next.js 16, App Router, TypeScript (`strict`, žádné `any`)
- Tailwind CSS v4 (CSS-first konfigurace přes `@theme` v `app/globals.css`)
- Bez databáze, bez env proměnných/secrets, bez externích API

## Struktura

```
app/
  layout.tsx   # metadata, favicony, OG obrázek
  page.tsx     # jediná stránka webu (logo, podtitulek, CTA na dajc.eu, patička)
public/
  brand/       # logo a favicony z DAJC-logo-pack
```

## Vývoj

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # produkční build
```

## Brand pravidla (závazné)

Zdroj: `C:\Users\mirda\DAJC-logo-pack\README.md`. Shrnutí:

- Barvy: `dajc-navy` `#00265C`, `dajc-orange` `#FF9F00`, tmavé pozadí
  `dajc-dark` `#061A33` — definované jako Tailwind tokeny v
  `app/globals.css`, stejné jako na dajc.eu.
- Na světlém pozadí používat barevnou/tmavou variantu loga, na tmavém
  pozadí bílou/oranžovou variantu (`DAJC-logo-dark-*.png`).
- Logo nikdy nedeformovat, neprotahovat, nepřidávat stín ani záři.
- Minimální šířka loga na webu: **140 px**.
- Kolem loga ponechat volný prostor alespoň ve výšce písmene „D“.

## Obsahová pravidla

- Termín „AI-first“ se v žádném textu na webu nepoužívá.
- Stránka je v angličtině (stejně jako dajc.eu) - jde o jednu krátkou
  odkazovou stránku, ne o lokalizovaný obsah, takže překlad do češtiny
  není potřeba.
- Nepřidávat sem News systém, blog, CMS ani žádnou duplicitu obsahu
  z dajc.eu - dajc.cz je čistě vstupní bod na dajc.eu.
