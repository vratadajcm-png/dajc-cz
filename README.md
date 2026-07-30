# dajc.cz

Reklamní/landing stránka pro **DAJC**, jejímž jediným cílem je propagovat
platformu [DAJC](https://dajc.eu) a odkazovat na ni. Statický marketingový
web — žádná databáze, žádná uživatelská logika, žádná vlastní aplikační
funkčnost. Později přibude jednoduchý blog s články o oversize cargo
(Markdown soubory v `content/articles/`).

> **Toto je oddělený projekt od hlavního aplikačního repozitáře DAJC.**
> Neobsahuje a nesmí obsahovat žádnou závislost na kódu hlavní aplikace ani
> sdílená npm workspaces — jde o samostatný git repozitář nasazovaný
> nezávisle.

## Stack

- Next.js 16, App Router, TypeScript (`strict`, žádné `any`)
- Tailwind CSS v4 (CSS-first konfigurace přes `@theme` v `app/globals.css`)
- Bez databáze, bez env proměnných/secrets

## Struktura

```
app/
  layout.tsx        # metadata, favicony, OG obrázek
  page.tsx           # landing page (hero, benefity, blog teaser, patička)
  clanky/
    page.tsx          # výpis článků
    [slug]/page.tsx    # detail článku (Markdown -> HTML)
lib/
  articles.ts         # čtení a parsování Markdown článků (gray-matter + marked)
content/
  articles/            # zdrojové .md články (zatím prázdné)
public/
  brand/                # logo a favicony z DAJC-logo-pack
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
  `app/globals.css`.
- Na světlém pozadí používat barevnou/tmavou variantu loga, na tmavém
  pozadí bílou/oranžovou variantu (`DAJC-logo-dark-*.png`).
- Logo nikdy nedeformovat, neprotahovat, nepřidávat stín ani záři.
- Minimální šířka loga na webu: **140 px**.
- Kolem loga ponechat volný prostor alespoň ve výšce písmene „D“.

## Obsahová pravidla

- Termín „AI-first“ se v žádném textu na webu nepoužívá.
- Veškerý obsah je v češtině.
