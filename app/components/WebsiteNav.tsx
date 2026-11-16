"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

const englishPages: Record<string,string> = {
  "/":"/", "/platform":"/platform", "/tar":"/tar",
  "/testovani":"/testing", "/demo":"/demo-guide",
  "/aktuality":"/news", "/soukromi":"/privacy",
  "/kontakt":"/", "/faq":"/"
};

export default function WebsiteNav() {
  const current=usePathname();
  const englishUrl="https://www.dajc.eu"+(englishPages[current]||"/");
  return (
    <header className="relative z-20 border-b border-dajc-line bg-dajc-dark/95">
      <nav aria-label="Hlavní navigace DAJC.cz" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-5 gap-y-3 px-5 py-4">
        <Link href="/" className="font-bold tracking-[0.15em] text-dajc-white" aria-label="DAJC.cz – úvod">DAJC<span className="text-dajc-orange">.cz</span></Link>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <Link href="/platform" className="hover:text-dajc-orange">Platform</Link>
          <Link href="/tar" className="hover:text-dajc-orange">TAR</Link>
          <Link href="/faq" className="hover:text-dajc-orange">FAQ</Link>
          <Link href="/demo" className="hover:text-dajc-orange">Demo</Link>
          <Link href="/kontakt" className="hover:text-dajc-orange">Kontakt</Link>
          <a href={englishUrl} hrefLang="en" lang="en" className="rounded border border-dajc-orange px-3 py-1.5 text-dajc-orange hover:bg-dajc-orange hover:text-dajc-dark">English · DAJC.eu</a>
        </div>
      </nav>
    </header>
  );
}
