"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import KochiSelect from '@/components/KochiSelect';
import { KOCHI_MUNICIPALITIES } from '@/lib/geo';
const BoatSail = dynamic(() => import("@/components/BoatSail"), { ssr: false });

export default function PostNeed(){
  const [step,setStep]=useState(1);
  const [title,setTitle]=useState("");
  const [desc,setDesc]=useState("");
  const [area,setArea]=useState<{type:'list'|'other', area:string}>({type:'list', area:''});
  const [category,setCategory]=useState("");
  const [city, setCity] = useState<string>('高知市');
  const [otherCity, setOtherCity] = useState('');
  const [sail, setSail] = useState(false);
  const router=useRouter();
  
  const titleOk = title.trim().length >= 4;
  const descOk = desc.trim().length >= 20;
  const selectedCity = city === 'その他' ? otherCity.trim() : city;
  const cityOk = selectedCity === '' || selectedCity.length >= 2;
  const canSubmit = titleOk && descOk && cityOk;
  async function submit(){
    const payload={title, description:desc, area: area.area, area_type: area.type, category, city: selectedCity || null};
    try{
      // DBが有効ならAPIを叩く（既存の /api/needs などがあれば差し替え。無ければlocal保存）
      if(process.env.NEXT_PUBLIC_SUPABASE_URL){ /* ここではUIのみ。APIは既存のを使う想定 */ }
      const key="np_needs_local";
      const arr=JSON.parse(localStorage.getItem(key)||"[]");
      arr.unshift({id:`local-${Date.now()}`, ...payload, progress:0, target:10, count:0});
      localStorage.setItem(key, JSON.stringify(arr));
      
      // 次画面で船を走らせる
      if (typeof window !== 'undefined') sessionStorage.setItem('np:sail','1')
      
      // 投稿成功時に船アニメーション
      setSail(true);
      setTimeout(() => {
        setSail(false);
        router.push("/needs");
      }, 3000);
    }catch{
      router.push("/needs");
    }
  }
  return (
    <>
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
              <input 
                required 
                aria-required="true" 
                placeholder="例: 社内研修プログラム開発"
                className="mt-1 w-full np-input px-3 py-2" 
                value={title} 
                onChange={e=>setTitle(e.target.value)} 
              />
              {!titleOk && <p className="mt-1 text-sm text-red-600">4文字以上で入力してください</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">詳細説明</label>
              <textarea 
                required 
                aria-required="true" 
                className="mt-1 w-full np-textarea px-3 py-2"
                placeholder="目的／範囲／成果物のイメージ（個人情報は書かない）"
                rows={5} 
                value={desc} 
                onChange={e=>setDesc(e.target.value)} 
              />
              {!descOk && <p className="mt-1 text-sm text-red-600">20文字以上で概要を書いてください</p>}
            </div>
            <div className="flex justify-end">
              <button 
                onClick={()=>setStep(2)} 
                disabled={!canSubmit}
                className={`btn btn-primary ${!canSubmit ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                次へ
              </button>
            </div>
          </div>
        )}
        {step===2 && (
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mt-6">エリア（高知県）</label>
                <div className="mt-1 flex gap-2">
                  <select className="np-input px-3 py-2 w-60" value={city} onChange={e=>setCity(e.target.value)}>
                    {KOCHI_MUNICIPALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                    <option value="その他">その他</option>
                  </select>
                  {city === 'その他' && (
                    <input className="np-input px-3 py-2 flex-1" placeholder="市町村名を入力（例：○○町）"
                           value={otherCity} onChange={e=>setOtherCity(e.target.value)} />
                  )}
                </div>
                {!cityOk && <p className="text-sm text-red-600 mt-1">市町村名を入力してください。</p>}
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
    {sail && <BoatSail onDone={() => setSail(false)} />}
    </>
  );
}
