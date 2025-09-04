"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { listNeeds, type Need } from "@/repo/needs";

function Badge({type}:{type: "archived"|"surfaced"|"completed"|"active"}) {
  const map = {
    active: "bg-slate-100 text-slate-700",
    archived: "bg-sky-100 text-sky-700",
    surfaced: "bg-amber-100 text-amber-800",
    completed: "bg-emerald-100 text-emerald-700",
  } as const;
  const label = { active:"", archived:"🌊 海中", surfaced:"⬆︎ 浮上中", completed:"✅ 成約" }[type];
  if(!label) return null;
  return <span className={`text-xs px-2 py-0.5 rounded ${map[type]}`}>{label}</span>
}

export default function NeedsIndex(){
  const [scope,setScope] = useState<"all"|"active"|"archived">("all");
  const [items,setItems] = useState<Need[]>([]);
  useEffect(()=>{
    listNeeds({scope}).then(r=>setItems(r.items));
  },[scope]);

  return <div className="mx-auto max-w-6xl p-6 space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">ニーズ一覧</h1>
      <div className="flex gap-2 text-sm">
        <button onClick={()=>setScope("all")} className={`px-2 py-1 rounded ${scope==="all"?"bg-slate-900 text-white":"bg-slate-100"}`}>すべて</button>
        <button onClick={()=>setScope("active")} className={`px-2 py-1 rounded ${scope==="active"?"bg-slate-900 text-white":"bg-slate-100"}`}>通常</button>
        <button onClick={()=>setScope("archived")} className={`px-2 py-1 rounded ${scope==="archived"?"bg-slate-900 text-white":"bg-slate-100"}`}>海中</button>
      </div>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(n=>(
        <div key={n.id} className="border rounded p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Link href={`/needs/${n.id}`} className="font-semibold hover:underline">{n.title}</Link>
            <Badge type={n.status==="archived" ? "archived" : n.status==="completed" ? "completed" : "active"} />
          </div>
          <div className="text-xs text-slate-600">更新: {new Date(n.updated_at).toLocaleDateString()}</div>
          <div className="text-xs text-slate-600">提案: {n.proposals}</div>
          <div className="pt-2 flex gap-2">
            <Link className="text-sm px-2 py-1 rounded border" href={`/needs/${n.id}`}>詳細</Link>
            <Link className="text-sm px-2 py-1 rounded border" href={`/needs/${n.id}#cta`}>提案する</Link>
          </div>
        </div>
      ))}
    </div>

    <div className="pt-6 border-t mt-6 text-right">
      <Link href="/sea" className="text-sky-700 hover:underline">→ 海中（過去のニーズ保管庫）を見る</Link>
    </div>
  </div>;
}
