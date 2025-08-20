"use client";
import { useState } from "react";

type Mode = "find" | "post";

export default function DualActionPanel() {
  const [mode, setMode] = useState<Mode>("find");
  
  const kochiCities = [
    "高知市", "香南市", "南国市", "土佐市", "須崎市", "四万十市", "宿毛市", "安芸市", "室戸市"
  ];

  const tabBase =
    "h-12 px-6 flex items-center gap-2 rounded-t-xl rounded-b-none -mb-px border text-sm font-medium";

  const tabFind = 
    tabBase +
    " tab-attach " +
    (mode === "find"
      ? "bg-[var(--panel-blue-bg)] text-[var(--panel-blue-text)] border-[var(--panel-blue-border)]"
      : "bg-[var(--panel-blue-accent)] text-white border-transparent hover:brightness-110");
      
  const tabPost = 
    tabBase +
    " tab-attach " +
    (mode === "post"
      ? "bg-[var(--panel-blue-bg)] text-[var(--panel-blue-text)] border-[var(--panel-blue-border)]"
      : "bg-[var(--panel-blue-accent)] text-white border-transparent hover:brightness-110");

  return (
    <section className="section">
      <div className="max-w-6xl mx-auto px-4">
        <div aria-label="search-or-post" className="mt-6">
          {/* タブ行 */}
          <div role="tablist" aria-label="need-tabs" className="flex gap-3 px-4">
            <button
              role="tab"
              aria-selected={mode === "find"}
              className={tabFind}
              onClick={() => setMode("find")}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              ニーズを探す
            </button>
            <button
              role="tab"
              aria-selected={mode === "post"}
              className={tabPost}
              onClick={() => setMode("post")}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4" />
              </svg>
              ニーズを投稿
            </button>
          </div>

          {/* 面（常に薄青） */}
          <div
            className="rounded-xl border mt-0 p-6 lg:p-7
                       bg-[var(--panel-blue-bg)]
                       border-[var(--panel-blue-border)]"
          >
            {mode === "find" ? (
              <FindForm kochiCities={kochiCities} />
            ) : (
              <PostQuick />
            )}
          </div>
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
          <label htmlFor="city" className="block text-sm font-medium text-[var(--panel-blue-text)] mb-2">所在地</label>
          <select 
            id="city"
            name="city" 
            className="w-full rounded-md border px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--panel-blue-accent)] focus:border-[var(--panel-blue-accent)]"
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
          <label htmlFor="category" className="block text-sm font-medium text-[var(--panel-blue-text)] mb-2">カテゴリ</label>
          <select 
            id="category"
            name="category" 
            className="w-full rounded-md border px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--panel-blue-accent)] focus:border-[var(--panel-blue-accent)]"
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
        <label htmlFor="keyword" className="block text-sm font-medium text-[var(--panel-blue-text)] mb-2">キーワード</label>
        <input 
          id="keyword"
          name="q" 
          type="text" 
          className="w-full rounded-md border px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--panel-blue-accent)] focus:border-[var(--panel-blue-accent)]" 
          placeholder="例：Webサイト制作、デザイン、システム開発"
        />
      </div>
      
      {/* よく使う市町村チップ */}
      <div>
        <p className="text-sm font-medium text-[var(--panel-blue-text)] mb-3">よく使う市町村</p>
        <div className="flex flex-wrap gap-2">
          {kochiCities.map((city) => (
            <button
              key={city}
              type="button"
              className="px-3 py-1 bg-white text-[var(--panel-blue-accent)] border border-[var(--panel-blue-accent)] rounded-full text-sm hover:bg-[var(--panel-blue-accent)] hover:text-white transition-colors"
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
        className="w-full bg-[var(--panel-blue-accent)] text-white rounded-xl py-3 font-semibold hover:opacity-90 transition-colors shadow-[var(--elev-1)]"
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
        <label htmlFor="title" className="block text-sm font-medium text-[var(--panel-blue-text)] mb-2">タイトル簡易入力</label>
        <input 
          id="title"
          name="title" 
          type="text" 
          className="w-full rounded-md border px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--panel-blue-accent)] focus:border-[var(--panel-blue-accent)]" 
          placeholder="まずは件名だけでもOK"
          required
        />
      </div>
      
      <button 
        type="submit" 
        className="w-full bg-[var(--panel-blue-accent)] text-white rounded-xl py-3 font-semibold hover:opacity-90 transition-colors shadow-[var(--elev-1)]"
      >
        投稿をはじめる
      </button>
    </form>
  );
}
