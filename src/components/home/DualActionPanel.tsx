"use client";
import { useState } from "react";

type Mode = "find" | "post";

export default function DualActionPanel() {
  const [mode, setMode] = useState<Mode>("find");
  
  const kochiCities = [
    "高知市", "香南市", "南国市", "土佐市", "須崎市", "四万十市", "宿毛市", "安芸市", "室戸市"
  ];

  return (
    <section className="np-full-bleed-to-aside">
      <div className="np-inner">
        <div className="flex gap-2 -mb-px">
          {/* 選択タブ = 面と同色 */}
          <button
            className={`h-12 px-4 rounded-t-lg transition-colors ${
              mode === "find"
                ? "bg-[var(--np-blue-bg)] text-[var(--np-ink)]"
                : "bg-[var(--np-blue)] text-white"
            }`}
            onClick={() => setMode("find")}
          >
            🔎 ニーズを探す
          </button>

          <button
            className={`h-12 px-4 rounded-t-lg transition-colors ${
              mode === "post"
                ? "bg-[var(--np-blue-bg)] text-[var(--np-ink)]"
                : "bg-[var(--np-blue)] text-white"
            }`}
            onClick={() => setMode("post")}
          >
            ＋ ニーズを投稿
          </button>
        </div>

        <div className="rounded-b-lg rounded-tr-lg bg-[var(--np-blue-bg)] border border-[var(--np-border)] p-6 lg:p-7">
          {mode === "find" ? (
            <FindForm kochiCities={kochiCities} />
          ) : (
            <PostQuick />
          )}
        </div>
      </div>
    </section>
  );
}

/** 検索フォーム */
function FindForm({ kochiCities }: { kochiCities: string[] }) {
  return (
    <form action="/needs" className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block np-sub text-sm mb-2">所在地</label>
          <select 
            id="city"
            name="city" 
            className="w-full rounded-md border px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--np-blue)] focus:border-[var(--np-blue)]"
          >
            <option value="">選択してください</option>
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
          <label htmlFor="category" className="block np-sub text-sm mb-2">カテゴリ</label>
          <select 
            id="category"
            name="category" 
            className="w-full rounded-md border px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--np-blue)] focus:border-[var(--np-blue)]"
          >
            <option value="">選択してください</option>
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
        <label htmlFor="keyword" className="block np-sub text-sm mb-2">キーワード</label>
                  <input 
            id="keyword"
            name="q" 
            type="text" 
            className="w-full rounded-md border px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--np-blue)] focus:border-[var(--np-blue)]" 
            placeholder="例：Webサイト制作、デザイン、システム開発"
          />
      </div>
      
      {/* よく使う市町村チップ */}
      <div>
        <p className="np-sub text-sm mb-3">よく使う市町村</p>
        <div className="flex flex-wrap gap-2">
          {kochiCities.map((city) => (
            <button
              key={city}
              type="button"
              className="np-chip hover:bg-[var(--np-blue-bg)] transition-colors"
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
        className="mt-6 w-full h-11 bg-[var(--np-blue)] text-white rounded-lg font-semibold hover:opacity-90 transition-colors"
      >
        検索する
      </button>
    </form>
  );
}

/** 投稿フォーム */
function PostQuick() {
  return (
    <form action="/post" className="space-y-6">
      <div>
        <label htmlFor="title" className="block np-sub text-sm mb-2">タイトル簡易入力</label>
                  <input 
            id="title"
            name="title" 
            type="text" 
            className="w-full rounded-md border px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--np-blue)] focus:border-[var(--np-blue)]" 
            placeholder="まずは件名だけでもOK"
            required
          />
      </div>
      
      <button 
        type="submit" 
        className="mt-6 w-full h-11 bg-[var(--np-blue)] text-white rounded-lg font-semibold hover:opacity-90 transition-colors"
      >
        投稿をはじめる
      </button>
    </form>
  );
}
