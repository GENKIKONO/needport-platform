"use client";
import { useState } from "react";
import { MagnifyingGlassIcon as SearchIcon, PlusIcon } from "@/components/icons";

// フォームコンポーネント
function Select({ placeholder }: { placeholder: string }) {
  return (
    <select className="w-full rounded-md border border-slate-200/40 px-4 h-11 bg-white focus:ring-2 focus:ring-[var(--np-blue)] focus:border-[var(--np-blue)]">
      <option value="">{placeholder}</option>
      {placeholder === "エリアを選択" && (
        <>
          <option value="高知市">高知市</option>
          <option value="室戸市">室戸市</option>
          <option value="安芸市">安芸市</option>
          <option value="南国市">南国市</option>
          <option value="土佐市">土佐市</option>
          <option value="須崎市">須崎市</option>
          <option value="宿毛市">宿毛市</option>
          <option value="土佐清水市">土佐清水市</option>
          <option value="四万十市">四万十市</option>
          <option value="香南市">香南市</option>
          <option value="香美市">香美市</option>
        </>
      )}
      {placeholder === "カテゴリを選択" && (
        <>
          <option value="IT・システム">IT・システム</option>
          <option value="デザイン・クリエイティブ">デザイン・クリエイティブ</option>
          <option value="マーケティング">マーケティング</option>
          <option value="営業・販売">営業・販売</option>
          <option value="事務・管理">事務・管理</option>
          <option value="製造・技術">製造・技術</option>
          <option value="サービス">サービス</option>
          <option value="その他">その他</option>
        </>
      )}
    </select>
  );
}

function Input({ placeholder, name, required }: { placeholder: string; name?: string; required?: boolean }) {
  return (
    <input 
      name={name}
      type="text" 
      className="w-full rounded-md border border-slate-200/40 px-4 h-11 bg-white focus:ring-2 focus:ring-[var(--np-blue)] focus:border-[var(--np-blue)]" 
      placeholder={placeholder}
      required={required}
    />
  );
}

function CityChips({ cities }: { cities: string[] }) {
  return (
    <div>
      <p className="text-sm text-[var(--np-ink)] mb-3">よく使うエリア</p>
      <div className="flex flex-wrap gap-2">
        {cities.map((city) => (
          <button
            key={city}
            type="button"
            className="px-3 py-1.5 text-[15px] bg-white text-[var(--np-blue)] border border-[var(--np-blue)] rounded-full hover:bg-[var(--np-blue)] hover:text-white transition-colors"
            onClick={() => {
              const select = document.getElementById('city') as HTMLSelectElement;
              if (select) select.value = city;
            }}
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  );
}

function Button({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <button type="submit" className={`h-11 rounded-lg font-semibold hover:opacity-90 transition-colors ${className}`}>
      {children}
    </button>
  );
}

export default function DualActionPanel() {
  const [tab, setTab] = useState<'find'|'post'>('find');

  return (
    <section className="np-bleed-left pt-6">
      {/* 付箋タブ */}
      <div className="np-bookmark-tabs">
        <button
          className={`np-tab ${tab==='find'?'np-tab--active':'np-tab--inactive'}`}
          onClick={()=>setTab('find')}
        >
          <span className="inline-flex items-center gap-2">
            <SearchIcon className="w-5 h-5"/> ニーズを探す
          </span>
        </button>
        <button
          className={`np-tab ${tab==='post'?'np-tab--active':'np-tab--inactive'}`}
          onClick={()=>setTab('post')}
        >
          <span className="inline-flex items-center gap-2">
            <PlusIcon className="w-5 h-5"/> ニーズを投稿
          </span>
        </button>
      </div>

      {/* パネル（常に薄青） */}
      <div className="np-panel np-pad mx-auto mt-2" style={{width:'min(1100px, 96vw)'}}>
        {tab==='find' ? <FindForm/> : <PostFormLite/>}
      </div>
    </section>
  );
}

/* フォーム（ラベルはplaceholder内に寄せ、上下を1行に） */
function FindForm(){
  const kochiCities = [
    "高知市", "香南市", "南国市", "土佐市", "須崎市", "四万十市", "宿毛市", "安芸市", "室戸市"
  ];

  return (
    <form action="/needs" className="grid gap-4 md:gap-5">
      <div className="grid md:grid-cols-2 gap-4">
        <Select placeholder="エリアを選択"/>
        <Select placeholder="カテゴリを選択"/>
      </div>
      <Input placeholder="キーワード（例：Webサイト制作、デザイン…）"/>
      <CityChips cities={kochiCities}/>
      <div className="mt-2">
        <Button className="w-full md:w-auto bg-[var(--np-blue)] hover:brightness-110">検索する</Button>
      </div>
    </form>
  );
}

function PostFormLite() {
  return (
    <form action="/post" className="grid gap-4">
      <Input 
        name="title" 
        placeholder="タイトル（まずは件名だけでもOK）"
        required
      />
      <div className="mt-2">
        <Button className="w-full md:w-auto bg-[var(--np-blue)] hover:brightness-110">投稿をはじめる</Button>
      </div>
    </form>
  );
}
