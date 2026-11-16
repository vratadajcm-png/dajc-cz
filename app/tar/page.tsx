import type { Metadata } from "next";
import ProductPage from "../components/ProductPage";
export const metadata: Metadata = {
  title:"DAJC TAR | Odtah, asistence a vyproštění",
  description:"Český přehled DAJC TAR: Recovery Passport, dispečink, smíšená flotila, evidence zásahů, partneři a vyúčtování. Produkt ve vývoji, nikoli aktivní služba.",
  alternates:{canonical:"https://www.dajc.cz/tar",languages:{"cs-CZ":"https://www.dajc.cz/tar",en:"https://www.dajc.eu/tar"}},
};
export default function Page(){return <ProductPage product="tar"/>;}
