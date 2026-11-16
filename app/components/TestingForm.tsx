"use client";
import { useState, type FormEvent } from "react";
const inputClass="w-full min-w-0 rounded-lg border border-dajc-muted bg-dajc-dark p-3 text-dajc-white focus-visible:outline-2 focus-visible:outline-dajc-orange";
const roles=[["carrier","Dopravce"],["dispatcher","Dispečer"],["driver","Řidič"],["shipper","Zadavatel"],["escort","Doprovod"],["permits","Specialista na povolení"],["other","Jiná profesní role"]];
export default function TestingForm(){
  const [status,setStatus]=useState("");
  const [success,setSuccess]=useState(false);
  const [sending,setSending]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();if(sending)return;
    const form=e.currentTarget;const fd=new FormData(form);
    const role=fd.getAll("role").map(String);
    if(!role.length){setSuccess(false);setStatus("Zvolte alespoň jednu profesní roli.");return;}
    const payload={
      fullName:fd.get("fullName"),company:fd.get("company"),businessEmail:fd.get("businessEmail"),
      country:fd.get("country"),operationType:fd.get("operationType"),fleetSize:fd.get("fleetSize"),
      biggestProblem:fd.get("biggestProblem"),role,website:fd.get("website"),
      consent:fd.get("consent")==="on",source:"dajc.cz/testovani"
    };
    setStatus("");setSending(true);
    try{
      const response=await fetch("https://www.dajc.eu/api/testing-register",{
        method:"POST",mode:"cors",credentials:"omit",
        headers:{"Content-Type":"application/json"},body:JSON.stringify(payload),
        signal:AbortSignal.timeout(20000)
      });
      const data:{ok?:boolean}=await response.json();
      if(!response.ok||!data.ok)throw new Error("Not accepted");
      form.reset();setSuccess(true);setStatus("Děkujeme, registrace byla přijata.");
    }catch{
      setSuccess(false);setStatus("Přijetí se nepodařilo potvrdit. Napište na platform@dajc.cz.");
    }finally{setSending(false);}
  }
  return <form onSubmit={submit} aria-label="Registrace k testování DAJC Platform" className="mt-7 grid gap-5 rounded-xl border border-dajc-line bg-dajc-navy/20 p-5 sm:p-8">
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="grid gap-2">Jméno a příjmení *<input name="fullName" className={inputClass} autoComplete="name" maxLength={120} required/></label>
      <label className="grid gap-2">Firma *<input name="company" className={inputClass} autoComplete="organization" maxLength={160} required/></label>
      <label className="grid gap-2">Pracovní e-mail *<input type="email" name="businessEmail" className={inputClass} autoComplete="email" maxLength={254} required/></label>
      <label className="grid gap-2">Země *<input name="country" className={inputClass} autoComplete="country-name" maxLength={120} required/></label>
    </div>
    <fieldset><legend className="text-sm font-semibold">Profese (alespoň jedna) *</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">{roles.map(([value,label])=><label key={value} className="flex items-center gap-2 text-sm text-dajc-muted"><input name="role" type="checkbox" value={value} className="accent-dajc-orange"/>{label}</label>)}</div></fieldset>
    <label className="grid gap-2">Druh činnosti (nepovinné)<input name="operationType" className={inputClass} maxLength={180}/></label>
    <label className="grid gap-2">Velikost flotily nebo firmy (nepovinné)<input name="fleetSize" className={inputClass} maxLength={80}/></label>
    <label className="grid gap-2">Největší provozní problém (nepovinné)<textarea name="biggestProblem" className={inputClass} maxLength={2500} rows={3}/></label>
    <label className="flex items-start gap-3 text-sm text-dajc-muted"><input type="checkbox" name="consent" required className="mt-1 accent-dajc-orange"/><span>Četl/a jsem <a href="https://www.dajc.eu/privacy" target="_blank" rel="noopener noreferrer" className="text-dajc-orange underline">zásady ochrany osobních údajů (EN)</a> a souhlasím se zpracováním registrace pro účast v testování. *</span></label>
    <label aria-hidden="true" className="absolute -left-[9999px]">Web<input name="website" tabIndex={-1} autoComplete="off"/></label>
    <button type="submit" disabled={sending} className="min-h-12 rounded-lg bg-dajc-orange px-4 font-semibold text-dajc-dark disabled:opacity-60">{sending?"Odesílání…":"Odeslat registraci"}</button>
    <p role="status" aria-live="polite" className={success?"text-sm text-green-300":"text-sm text-dajc-orange"}>{status}</p>
    <p className="text-xs leading-relaxed text-dajc-muted">Údaje přebírá DAJC.eu a tým DAJC. Registrace není objednávka ani odběr marketingu. Při potížích napište na <a className="text-dajc-orange underline" href="mailto:platform@dajc.cz">platform@dajc.cz</a>.</p>
  </form>;
}
