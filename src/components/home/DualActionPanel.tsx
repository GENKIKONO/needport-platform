"use client";
import { useState, KeyboardEvent } from "react";

type Mode = "find" | "post";

export default function DualActionPanel() {
  const [mode, setMode] = useState<Mode>("find");
  
  const kochiCities = [
    "高知市", "香南市", "南国市", "土佐市", "須崎市", "四万十市", "宿毛市", "安芸市", "室戸市"
  ];

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      setMode((m) => (m === "find" ? "post" : "find"));
    }
  };

  return (
    <section className="section">
      <div className="max-w-6xl mx-auto px-4">
        <div
          className="ndp-panel p-4 sm:p-6 lg:p-8"
          data-mode={mode}
          aria-label="ニーズの検索/投稿 切替エリア"
        >
          {/* タブ（セグメント） */}
          <div
            className="ndp-tabbar mb-4"
            role="tablist"
            aria-label="モード切替"
            onKeyDown={onKey}
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "find"}
              className="ndp-tab"
              onClick={() => setMode("find")}
            >
              🔎 ニーズを探す
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={mode === "post"}
              className="ndp-tab"
              onClick={() => setMode("post")}
            >
              ＋ ニーズを投稿
            </button>
          </div>

          {/* コンテンツ */}
          <div>
            {mode === "find" ? (
              <FindNeedsForm kochiCities={kochiCities} />
            ) : (
              <QuickPostForm />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** 検索フォーム */
function FindNeedsForm({ kochiCities }: { kochiCities: string[] }) {
  return (
    <form action="/needs" className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-2">所在地</label>
          <select 
            id="city"
            name="city" 
            className="w-full rounded-md border px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--ndp-find-accent)] focus:border-[var(--ndp-find-accent)]"
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
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">カテゴリ</label>
          <select 
            id="category"
            name="category" 
            className="w-full rounded-md border px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--ndp-find-accent)] focus:border-[var(--ndp-find-accent)]"
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
        <label htmlFor="keyword" className="block text-sm font-medium text-slate-700 mb-2">キーワード</label>
        <input 
          id="keyword"
          name="q" 
          type="text" 
          className="w-full rounded-md border px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--ndp-find-accent)] focus:border-[var(--ndp-find-accent)]" 
          placeholder="例：Webサイト制作、デザイン、システム開発"
        />
      </div>
      
      {/* よく使う市町村チップ */}
      <div>
        <p className="text-sm font-medium text-slate-700 mb-3">よく使う市町村</p>
        <div className="flex flex-wrap gap-2">
          {kochiCities.map((city) => (
            <button
              key={city}
              type="button"
              className="px-3 py-1 bg-white text-[var(--ndp-find-accent)] border border-[var(--ndp-find-accent)] rounded-full text-sm hover:bg-[var(--ndp-find-accent)] hover:text-white transition-colors"
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
        className="w-full bg-[var(--ndp-find-accent)] text-white rounded-xl py-3 font-semibold hover:opacity-90 transition-colors shadow-[var(--elev-1)]"
      >
        検索する
      </button>
    </form>
  );
}

/** 投稿フォーム */
function QuickPostForm() {
  return (
    <form action="/post" className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">タイトル簡易入力</label>
        <input 
          id="title"
          name="title" 
          type="text" 
          className="w-full rounded-md border px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--ndp-post-accent)] focus:border-[var(--ndp-post-accent)]" 
          placeholder="まずは件名だけでもOK"
          required
        />
      </div>
      
      <button 
        type="submit" 
        className="w-full bg-[var(--ndp-post-accent)] text-white rounded-xl py-3 font-semibold hover:opacity-90 transition-colors shadow-[var(--elev-1)]"
      >
        投稿をはじめる
      </button>
    </form>
  );
}
