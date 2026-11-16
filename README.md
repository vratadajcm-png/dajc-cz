# DAJC.cz — česká část DAJC

Samostatný web Next.js 16 (TypeScript, Tailwind), určený českému publiku. Hlavní anglický web: https://www.dajc.eu/.

Stránky: úvod, /platform, /tar, /testovani, /demo, /faq, /kontakt, /aktuality.

DAJC Platform a DAJC TAR jsou samostatné produkty ve vývoji. Platform: předprodukční testování plánováno na Q3 2027, přesný den není potvrzen. TAR: průzkum a vývoj, žádná živá asistenční služba.

Czech testing and research forms send to the existing DAJC.eu APIs using explicit CORS allowlists. The project has no local database or secrets. Requires the matching draft PR for DAJC.eu to allow Czech origins on /api/market-research. Deployment of this branch before that PR is merged would leave Czech research forms unavailable.

Never claim live provider integrations, official approvals, signed partners or real production access. No separate Early Access or pilot.

Run checks:

    npm ci
    npm run lint
    npm run build

Before deployment, verify cross-domain CORS preflight, both forms, negative/timeout scenarios, production privacy notice and accessibility on mobile. Do not deploy automatically.
