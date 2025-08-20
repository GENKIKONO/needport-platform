"use client";
import { useState } from "react";

type Mode = "find" | "post";

export default function DualActionPanel() {
  const [mode, setMode] = useState<Mode>("find");
  
  const kochiCities = [
    "高知市", "香南市", "南国市", "土佐市", "須崎市", "四万十市", "宿毛市", "安芸市", "室戸市"
  ];

  return (
    <section className="mt-12">
      {/* タブ行 - 左右いっぱいに（面と一体化）＆枠線禁止 */}
      <div className="np-fullbleed-left w-full max-w-none flex gap-2 -mb-px">
        <button
          className={`h-12 px-6 font-semibold rounded-t-[8px] rounded-b-none -mb-px ${
            mode === "find"
              ? "bg-[var(--np-blue-bg)] text-[var(--np-ink)]"
              : "bg-[var(--np-blue-ac)] text-white"
          }`}
          onClick={() => setMode("find")}
        >
          🔎 ニーズを探す
        </button>

        <button
          className={`h-12 px-6 font-semibold rounded-t-[8px] rounded-b-none -mb-px ${
            mode === "post"
              ? "bg-[var(--np-blue-bg)] text-[var(--np-ink)]"
              : "bg-[var(--np-blue-ac)] text-white"
          }`}
          onClick={() => setMode("post")}
        >
          ＋ ニーズを投稿
        </button>
      </div>

      {/* 面 - フルブリード（左ドック端 or SPは画面端まで）＆枠線・影・角丸を除去 */}
      <section
        className="np-fullbleed-left bg-[var(--np-blue-bg)] border-0 ring-0 shadow-none rounded-none p-6 md:p-7 lg:p-8"
      >
        {mode === "find" ? (
          <FindForm kochiCities={kochiCities} />
        ) : (
          <PostQuick />
        )}
      </section>
    </section>
  );
}

/** 検索フォーム */
function FindForm({ kochiCities }: { kochiCities: string[] }) {
  return (
    <form action="/needs" className="space-y-4 md:space-y-5">
      <div className="grid md:grid-cols-2 gap-4 md:gap-5">
        <div>
          <select 
            id="city"
            name="city" 
            aria-label="エリア"
            className="w-full rounded-md border px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--np-blue-ac)] focus:border-[var(--np-blue-ac)]"
          >
            <option value="">エリアを選択</option>
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
          </select>
        </div>
        
        <div>
          <select 
            id="category"
            name="category" 
            aria-label="カテゴリ"
            className="w-full rounded-md border px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--np-blue-ac)] focus:border-[var(--np-blue-ac)]"
          >
            <option value="">カテゴリを選択</option>
            <option value="IT・システム">IT・システム</option>
            <option value="デザイン・クリエイティブ">デザイン・クリエイティブ</option>
            <option value="マーケティング">マーケティング</option>
            <option value="営業・販売">営業・販売</option>
            <option value="事務・管理">事務・管理</option>
            <option value="製造・技術">製造・技術</option>
            <option value="サービス">サービス</option>
            <option value="その他">その他</option>
          </select>
        </div>
      </div>
      
      <div>
        <input 
          id="keyword"
          name="q" 
          type="text" 
          className="w-full rounded-md border px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--np-blue-ac)] focus:border-[var(--np-blue-ac)]" 
          placeholder="キーワード（例：Webサイト制作、デザイン、システム開発）"
        />
      </div>
      
      {/* よく使う市町村チップ */}
      <div>
        <p className="text-sm text-[var(--np-ink)] mb-3">よく使うエリア</p>
        <div className="flex flex-wrap gap-2">
          {kochiCities.map((city) => (
            <button
              key={city}
              type="button"
              className="px-3 py-1.5 text-[15px] bg-white text-[var(--np-blue-ac)] border border-[var(--np-blue-ac)] rounded-full hover:bg-[var(--np-blue-ac)] hover:text-white transition-colors"
              onClick={() => {
                const select = document.getElementById('city') as HTMLSelectElement;
                if (select) {
                  select.value = city;
                }
              }}
            >
              {city}
            </button>
          ))}
        </div>
      </div>
      
      <button 
        type="submit" 
        className="mt-6 w-full h-11 bg-[var(--np-blue-ac)] text-white rounded-lg font-semibold hover:opacity-90 transition-colors"
      >
        検索する
      </button>
    </form>
  );
}

/** 投稿フォーム */
function PostQuick() {
  return (
    <form action="/post" className="space-y-4 md:space-y-5">
      <div>
        <input 
          id="title"
          name="title" 
          type="text" 
          className="w-full rounded-md border px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--np-blue-ac)] focus:border-[var(--np-blue-ac)]" 
          placeholder="タイトル（まずは件名だけでもOK）"
          required
        />
      </div>
      
      <button 
        type="submit" 
        className="mt-6 w-full h-11 bg-[var(--np-blue-ac)] text-white rounded-lg font-semibold hover:opacity-90 transition-colors"
      >
        投稿をはじめる
      </button>
    </form>
  );
}
