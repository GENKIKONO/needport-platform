"use client";
import { useEffect, useState } from "react";
import { Building2, BadgeCheck } from "lucide-react";

type P = { page:number, size:number, cat?:string, area?:string };
type Vendor = { id:string; name:string; area?:string; categories?:string[]; nonCommission?:boolean };

export default function VendorsList({ page, size, cat, area }: P){
  const [data,setData] = useState<Vendor[]|null>(null);
  const [err,setErr] = useState<string|null>(null);
  useEffect(()=>{
    const u = new URL("/api/vendors", window.location.origin);
    u.searchParams.set("page", String(page));
    u.searchParams.set("size", String(size));
    if(cat) u.searchParams.set("cat", cat);
    if(area) u.searchParams.set("area", area);
    fetch(u.toString()).then(r=>r.ok?r.json():Promise.reject(r.statusText))
      .then(setData).catch(e=>setErr(String(e)));
  },[page,size,cat,area]);
  if(err) return <div className="text-red-600">読み込みエラー: {err}</div>;
  if(!data) return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({length:9}).map((_,i)=><div key={i} className="h-28 rounded border animate-pulse bg-slate-50"/>)}</div>;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {data.map(v=>(
        <div key={v.id} className="rounded border p-3 flex items-start gap-3">
          <Building2 className="w-5 h-5 text-slate-500 mt-0.5" aria-hidden/>
          <div className="min-w-0">
            <div className="font-semibold flex items-center gap-2">
              <span className="truncate">{v.name}</span>
              {v.nonCommission && <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-700"><BadgeCheck className="w-3 h-3"/> 成果報酬対象外</span>}
            </div>
            <div className="text-sm text-slate-600">{v.area || "エリア未設定"}</div>
            {v.categories?.length ? <div className="mt-1 text-xs text-slate-600 line-clamp-1">{v.categories.join(" / ")}</div> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
