"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function PostNeed(){
  const [step,setStep]=useState(1);
  const [title,setTitle]=useState("");
  const [desc,setDesc]=useState("");
  const [area,setArea]=useState("");
  const [category,setCategory]=useState("");
  const router=useRouter();
  async function submit(){
    const payload={title, description:desc, area, category};
    try{
      // DBが有効ならAPIを叩く（既存の /api/needs などがあれば差し替え。無ければlocal保存）
      if(process.env.NEXT_PUBLIC_SUPABASE_URL){ /* ここではUIのみ。APIは既存のを使う想定 */ }
      const key="np_needs_local";
      const arr=JSON.parse(localStorage.getItem(key)||"[]");
      arr.unshift({id:`local-${Date.now()}`, ...payload, progress:0, target:10, count:0});
      localStorage.setItem(key, JSON.stringify(arr));
    }finally{
      router.push("/needs");
    }
  }
  return (
    <main className="section space-y-6">
      <h1 className="text-2xl font-bold">ニーズ投稿</h1>
      <div className="np-card p-6 space-y-4">
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500" style={{width:`${step===1?50:100}%`}}/>
        </div>
        {step===1 && (
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700">ニーズのタイトル</label>
              <input value={title} onChange={e=>setTitle(e.target.value)} className="mt-1 w-full np-input px-3 py-2" placeholder="例: 地下室がある家を建てたい" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">詳細説明</label>
              <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={5} className="mt-1 w-full np-textarea px-3 py-2" placeholder="具体的な要望や条件など…"/>
            </div>
            <div className="flex justify-end">
              <button onClick={()=>setStep(2)} className="btn btn-primary">次へ</button>
            </div>
          </div>
        )}
        {step===2 && (
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700">エリア</label>
                <input value={area} onChange={e=>setArea(e.target.value)} className="mt-1 w-full np-input px-3 py-2" placeholder="例: 高知市" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">カテゴリー</label>
                <input value={category} onChange={e=>setCategory(e.target.value)} className="mt-1 w-full np-input px-3 py-2" placeholder="例: 住宅・建築" />
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button onClick={()=>setStep(1)} className="btn">戻る</button>
              <button onClick={submit} className="btn btn-primary">投稿する</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
