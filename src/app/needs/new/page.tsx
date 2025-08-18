"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewNeedPage() {
  const [title,setTitle]=useState("");
  const [body,setBody]=useState("");
  const [yen,setYen]=useState<number | "">("");
  const [saving,setSaving]=useState(false);
  const router = useRouter();

  async function submit(e:React.FormEvent){
    e.preventDefault();
    setSaving(true);
    try{
      const res = await fetch("/api/needs",{
        method:"POST",
        headers:{ "Content-Type":"application/json"},
        body: JSON.stringify({ title, body, estimateYen: yen===""?undefined:Number(yen) })
      });
      if(!res.ok) throw new Error(await res.text());
      alert("投稿を受け付けました。公開前に管理者が確認します。");
      router.push("/"); // or /needs
    }catch(e:any){
      alert("投稿失敗: "+e.message);
    }finally{
      setSaving(false);
    }
  }
  return (
    <main className="container max-w-2xl py-10">
      <h1 className="text-2xl font-bold mb-4">ニーズを投稿</h1>
      <form className="space-y-4" onSubmit={submit}>
        <label className="block">
          <div className="text-sm text-gray-600">タイトル *</div>
          <input required className="mt-1 w-full rounded border px-3 py-2"
            value={title} onChange={(e)=>setTitle(e.target.value)}/>
        </label>
        <label className="block">
          <div className="text-sm text-gray-600">本文</div>
          <textarea className="mt-1 w-full rounded border px-3 py-2 min-h-[120px]"
            value={body} onChange={(e)=>setBody(e.target.value)} />
        </label>
        <label className="block">
          <div className="text-sm text-gray-600">目安予算（円）</div>
          <input type="number" className="mt-1 w-full rounded border px-3 py-2"
            value={yen} onChange={(e)=>setYen(e.target.value===""? "": Number(e.target.value))}/>
        </label>
        <button className="rounded bg-sky-600 text-white px-4 py-2 disabled:opacity-50" disabled={saving}>
          {saving?"送信中...":"送信"}
        </button>
      </form>
    </main>
  );
}
