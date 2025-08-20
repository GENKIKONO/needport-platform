"use client";
import { useState } from "react";
import { KOCHI_CITIES, KOCHI_TOWNS, KOCHI_ALL } from "@/constants/kochi";

type Props = {
  value?: string;
  onChange: (v: string) => void;
};
const OTHER = "その他";

export default function AreaSelect({ value = "", onChange }: Props){
  const [custom, setCustom] = useState("");

  const handle = (v:string)=>{
    onChange(v);
    if(v!==OTHER) setCustom("");
  };

  return (
    <div className="space-y-2">
      <select
        className="h-12 md:h-12.5 px-4 md:px-5 text-[15px] w-full border border-slate-200/40 bg-white focus:ring-2 focus:ring-[var(--np-blue)] focus:border-[var(--np-blue)] rounded-md"
        value={KOCHI_CITIES.concat(KOCHI_TOWNS).includes(value as any) ? value : (value?OTHER:"")}
        onChange={(e)=>handle(e.target.value)}
      >
        <option value="" disabled>エリアを選択</option>
        <optgroup label="市">
          {KOCHI_CITIES.map(n=> <option key={n} value={n}>{n}</option>)}
        </optgroup>
        <optgroup label="町・村">
          {KOCHI_TOWNS.map(n=> <option key={n} value={n}>{n}</option>)}
        </optgroup>
        <option value={OTHER}>{OTHER}</option>
      </select>

      { (value===OTHER || (!!value && !KOCHI_ALL.includes(value as any))) && (
        <input
          className="h-12 md:h-12.5 px-4 md:px-5 text-[15px] w-full border border-slate-200/40 bg-white focus:ring-2 focus:ring-[var(--np-blue)] focus:border-[var(--np-blue)] rounded-md mt-3"
          placeholder="エリアを入力（例：●●郡××村）"
          value={custom}
          onChange={(e)=>{ setCustom(e.target.value); onChange(e.target.value || OTHER); }}
        />
      )}
    </div>
  );
}
