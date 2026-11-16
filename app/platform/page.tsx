import type { Metadata } from "next";
import ProductPage from "../components/ProductPage";
export const metadata: Metadata = {
  title:"DAJC Platform | Nadrozměrná a těžká přeprava",
  description:"Český přehled zamýšlených funkcí DAJC Platform: D-ID, povolení, trasy, dispečink, dokumenty a napojení existujících systémů. Testování plánováno na Q3 2027.",
  alternates:{canonical:"https://www.dajc.cz/platform",languages:{"cs-CZ":"https://www.dajc.cz/platform",en:"https://www.dajc.eu/platform"}},
};
export default function Page(){return <ProductPage product="platform"/>;}
