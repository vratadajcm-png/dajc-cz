"use client";
import { useRef, useState, type FormEvent } from "react";

type Product = "platform" | "tar";
const options:Record<Product,Array<[string,string]>> = {
  platform: [["coordination","Jeden záznam přepravy a předávání"],["permits","Trasy, povolení a omezení"],["documents","Dokumenty a informace řidičům"],["integrations","Napojení stávajících systémů"]],
  tar: [["dispatch","Dispečink smíšené flotily"],["case","Evidence jednoho zásahu"],["partners","Předávání v asistenční a partnerské síti"],["billing","Záznam práce a fakturace"]]
};
const inputClass="w-full min-w-0 rounded-lg border border-dajc-muted bg-dajc-dark p-3 text-dajc-white focus-visible:outline-2 focus-visible:outline-dajc-orange";
export default function ResearchForm({product}:{product:Product}){
  const [status,setStatus]=useState("");
  const [success,setSuccess]=useState(false);
  const [sending,setSending]=useState(false);
  const id=useRef<string|null>(null);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    if(sending)return;
    const form=e.currentTarget;
    const fd=new FormData(form);
    if(fd.get("followUp")==="on"&&!String(fd.get("email")||"").trim()){
      setSuccess(false);setStatus("Pro kontakt vyplňte e-mail.");return;
    }
    id.current ??= crypto.randomUUID();
    const payload={...Object.fromEntries(fd.entries()),product,submissionId:id.current};
    setStatus("");setSending(true);
    try{
      const response=await fetch("https://www.dajc.eu/api/market-research",{
        method:"POST",mode:"cors",credentials:"omit",
        headers:{"Content-Type":"application/json"},body:JSON.stringify(payload),
        signal:AbortSignal.timeout(20000)
      });
      const data:{ok?:boolean}=await response.json();
      if(!response.ok||!data.ok)throw new Error("Not accepted");
      form.reset();id.current=null;setSuccess(true);setStatus("Děkujeme, vaše odpověď byla přijata.");
    }catch{
      setSuccess(false);setStatus("Přijetí nebylo potvrzeno. Zkuste to později nebo napište na team@dajc.eu.");
    }finally{setSending(false);}
  }
  return <form onSubmit={submit} className="mt-7 grid gap-4 rounded-xl border border-dajc-line bg-dajc-navy/20 p-5 sm:p-8" aria-label={"Průzkum "+product}>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="grid gap-2">Firma *<input className={inputClass} name="company" maxLength={160} autoComplete="organization" required/></label>
      <label className="grid gap-2">Země *<input className={inputClass} name="country" maxLength={100} autoComplete="country-name" required/></label>
    </div>
    <label className="grid gap-2">Vaše role *<select name="role" defaultValue="" className={inputClass} required><option disabled value="">Zvolte roli</option><option value="owner">Vedení firmy</option><option value="dispatcher">Dispečer</option><option value="driver">Řidič / technik</option><option value="customer">Zadavatel / asistenční organizace</option><option value="other">Jiná</option></select></label>
    <label className="grid gap-2">1. Jaké systémy dnes používáte? *<input name="currentSoftware" className={inputClass} maxLength={300} required/></label>
    <label className="grid gap-2">2. Co vám nejvíce komplikuje práci? *<textarea name="biggestProblem" className={inputClass} rows={3} maxLength={1500} required/></label>
    <label className="grid gap-2">3. Nejužitečnější navrhovaná funkce? *<select name="mostUseful" defaultValue="" className={inputClass} required><option disabled value="">Vyberte</option>{options[product].map(([value,label])=><option key={value} value={value}>{label}</option>)}<option value="none">Žádná z uvedených</option></select></label>
    <label className="grid gap-2">4. Uvažovali byste o používání DAJC? *<select name="usageInterest" defaultValue="" className={inputClass} required><option disabled value="">Vyberte</option><option value="yes">Ano</option><option value="maybe">Možná, podle výsledku</option><option value="no">Ne</option></select></label>
    <label className="grid gap-2">5. Byli byste za prokázaný přínos ochotni platit? *<select name="paymentInterest" defaultValue="" className={inputClass} required><option disabled value="">Vyberte</option><option value="yes">Ano</option><option value="maybe">Záleží na ceně a funkcích</option><option value="no">Ne</option></select></label>
    <label className="grid gap-2">Co byste doplnili? (nepovinné)<textarea name="suggestion" className={inputClass} rows={2} maxLength={1200}/></label>
    <label className="grid gap-2">Kontaktní e-mail (nepovinné)<input name="email" type="email" className={inputClass} maxLength={254} autoComplete="email"/></label>
    <label className="flex items-start gap-3 text-sm text-dajc-muted"><input type="checkbox" name="followUp" className="mt-1 accent-dajc-orange"/><span>DAJC mě smí kontaktovat pouze k mému příspěvku do průzkumu. Nejde o odběr reklamních sdělení.</span></label>
    <label className="flex items-start gap-3 text-sm text-dajc-muted"><input type="checkbox" name="privacyAcknowledged" required className="mt-1 accent-dajc-orange"/><span>Seznámil/a jsem se se <a className="text-dajc-orange underline" target="_blank" rel="noopener noreferrer" href="https://www.dajc.eu/privacy">zásadami ochrany osobních údajů (EN)</a>. *</span></label>
    <label aria-hidden="true" className="absolute -left-[9999px]">Web<input name="website" tabIndex={-1} autoComplete="off"/></label>
    <button type="submit" disabled={sending} className="min-h-12 rounded-lg bg-dajc-orange px-4 font-semibold text-dajc-dark disabled:opacity-60">{sending?"Odesílání…":"Odeslat odpověď"}</button>
    <p role="status" aria-live="polite" className={success?"text-sm text-green-300":"text-sm text-dajc-orange"}>{status}</p>
    <p className="text-xs leading-relaxed text-dajc-muted">Odpověď se odesílá do odděleného průzkumu DAJC.eu. Nejde o objednávku, partnerství ani registraci k testování.</p>
  </form>;
}
