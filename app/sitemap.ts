import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["/","/platform","/tar","/testovani","/demo","/faq","/aktuality","/kontakt"].map(path=>({
    url:"https://www.dajc.cz"+path,
    changeFrequency:"monthly" as const,
    priority:path==="/"?1:0.7,
  }));
}
