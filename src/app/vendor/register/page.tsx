"use client";
import { useState } from "react";

export default function VendorRegisterPage(){
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [note,setNote]=useState("");
  const [saving,setSaving]=useState(false);

  async function submit(e:React.FormEvent){
    e.preventDefault();
    setSaving(true);
    try{
      const res = await fetch("/api/vendor", {
        method:"POST", headers:{ "Content-Type":"application/json"},
        body: JSON.stringify({ name,email,note })
      });
      if(!res.ok) throw new Error(await res.text());
      alert("登録を受け付けました（審査中）");
    }catch(e:any){ alert("失敗: "+e.message); }
    finally{ setSaving(false); }
  }

  return (
    <main className="container max-w-2xl py-10">
      <h1 className="text-2xl font-bold mb-4">業者登録</h1>
      <form className="space-y-4" onSubmit={submit}>
        <input required placeholder="会社/屋号" className="w-full rounded border px-3 py-2"
          value={name} onChange={(e)=>setName(e.target.value)} />
        <input required type="email" placeholder="メールアドレス" className="w-full rounded border px-3 py-2"
          value={email} onChange={(e)=>setEmail(e.target.value)} />
        <textarea placeholder="得意領域・補足" className="w-full rounded border px-3 py-2 min-h-[100px]"
          value={note} onChange={(e)=>setNote(e.target.value)} />
        <button className="rounded bg-sky-600 text-white px-4 py-2 disabled:opacity-50" disabled={saving}>
          {saving?"送信中...":"送信"}
        </button>
      </form>
    </main>
  );
}
