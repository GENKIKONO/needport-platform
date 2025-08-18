"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewNeedPage() {
  const [title,setTitle]=useState("");
  const [body,setBody]=useState("");
  const [yen,setYen]=useState<number | "">("");
  const [email,setEmail]=useState("");
  const [introToken,setIntroToken]=useState("");
  const [saving,setSaving]=useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const c = document.cookie.split("; ").find(s => s.startsWith("intro_token="));
      if (c) setIntroToken(decodeURIComponent(c.split("=")[1]));
    } catch {}
  }, []);

  // 送信前に、必要なら紹介確定を呼ぶ（メール取得時）
  async function ensureReferral(email: string) {
    if (!introToken || !email) return;
    await fetch("/api/referrals/accept", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ token:introToken, email })
    }).catch(()=>{});
  }

  async function submit(e:React.FormEvent){
    e.preventDefault();
    setSaving(true);
    try{
      // 紹介確定を先に実行
      if (email) await ensureReferral(email);
      
      const res = await fetch("/api/needs",{
        method:"POST",
        headers:{ "Content-Type":"application/json"},
        body: JSON.stringify({ 
          title, 
          body, 
          estimateYen: yen===""?undefined:Number(yen),
          ownerEmail: email || undefined
        })
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
        <label className="block">
          <div className="text-sm text-gray-600">メールアドレス（任意）</div>
          <input type="email" className="mt-1 w-full rounded border px-3 py-2"
            value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="your@email.com"/>
        </label>
        <label className="block">
          <div className="text-sm text-gray-600">紹介コード（任意）</div>
          <input className="mt-1 w-full rounded border px-3 py-2"
            value={introToken} onChange={(e)=>setIntroToken(e.target.value)} placeholder="referral token" />
        </label>
        <button className="rounded bg-sky-600 text-white px-4 py-2 disabled:opacity-50" disabled={saving}>
          {saving?"送信中...":"送信"}
        </button>
      </form>
    </main>
  );
}
