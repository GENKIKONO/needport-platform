"use client";
import { useState } from "react";
import { KOCHI_CITIES, KOCHI_TOWNS, KOCHI_ALL } from "@/constants/kochi";

type Props = {
  value?: string;
  onChange: (v: string) => void;
};
const OTHER = "その他（自由入力）";

export default function AreaSelect({ value = "", onChange }: Props){
  const [custom, setCustom] = useState("");

  const handle = (v:string)=>{
    onChange(v);
    if(v!==OTHER) setCustom("");
  };

  return (
    <div className="space-y-2">
      <select
        className="np-field w-full"
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
          className="np-field w-full"
          placeholder="市町村名を入力（例：○○地区 など）"
          value={custom}
          onChange={(e)=>{ setCustom(e.target.value); onChange(e.target.value || OTHER); }}
        />
      )}
    </div>
  );
}
