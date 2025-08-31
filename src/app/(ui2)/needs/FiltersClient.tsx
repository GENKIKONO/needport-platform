"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function FiltersClient(){
  const router = useRouter();
  const sp = useSearchParams();
  const [q,setQ] = useState(sp.get('q') || '');
  const [region,setRegion] = useState(sp.get('region') || '');
  const [cat,setCat] = useState(sp.get('category') || '');

  useEffect(()=>{ setQ(sp.get('q')||''); setRegion(sp.get('region')||''); setCat(sp.get('category')||''); },[sp]);

  const apply = ()=>{
    const p = new URLSearchParams();
    if(q) p.set('q', q);
    if(region) p.set('region', region);
    if(cat) p.set('category', cat);
    router.push(`/v2/needs?${p.toString()}`);
  };
  const reset = ()=> router.push('/v2/needs');

  return (
    <div className="grid sm:grid-cols-4 gap-2 mb-4">
      <input className="border rounded px-3 py-2 text-sm" placeholder="キーワード" value={q} onChange={e=>setQ(e.target.value)} />
      <input className="border rounded px-3 py-2 text-sm" placeholder="地域" value={region} onChange={e=>setRegion(e.target.value)} />
      <input className="border rounded px-3 py-2 text-sm" placeholder="カテゴリ" value={cat} onChange={e=>setCat(e.target.value)} />
      <div className="flex gap-2">
        <button onClick={apply} className="px-3 py-2 rounded bg-sky-600 text-white text-sm">絞り込む</button>
        <button onClick={reset} className="px-3 py-2 rounded border text-sm">リセット</button>
      </div>
    </div>
  );
}
