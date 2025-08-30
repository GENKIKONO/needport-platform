"use client";
import { useState, useId, useRef, useEffect } from "react";
import { Search as SearchIcon, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface NeedsSearchPanelProps {
  defaultTab?: "search" | "post";
  className?: string;
}

export default function NeedsSearchPanel({
  defaultTab = "search",
  className = ""
}: NeedsSearchPanelProps) {
  const [tab, setTab] = useState<"search" | "post">(defaultTab);
  const [searchQuery, setSearchQuery] = useState({
    area: "",
    category: "",
    keyword: ""
  });
  const ids = { search: useId(), post: useId() };
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 左右矢印でタブ移動
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      setTab((t) => (t === "search" ? "post" : "search"));
    };
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.area) params.set('area', searchQuery.area);
    if (searchQuery.category) params.set('category', searchQuery.category);
    if (searchQuery.keyword) params.set('q', searchQuery.keyword);
    
    router.push(`/needs${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <section className={`relative mx-auto max-w-6xl px-4 sm:px-6 ${className}`}>
      {/* 付箋バー（紙の土台） */}
      <div className="relative rounded-none bg-[#B9D9F2] pb-3 pt-2 sm:pt-3">
        {/* 紙（PAPER）帯：タブの紙 */}
        <div className="absolute left-0 right-0 top-0 h-[56px] sm:h-[60px] bg-[#CFE4F7] rounded-none" aria-hidden />

        {/* タブリスト */}
        <div
          ref={listRef}
          role="tablist"
          aria-label="ニーズ操作"
          className="relative overflow-visible mx-4 flex items-stretch gap-4"
        >
          {/* ニーズを探す */}
          <button
            role="tab"
            id={ids.search + "-tab"}
            aria-controls={ids.search + "-panel"}
            aria-selected={tab === "search"}
            onClick={() => setTab("search")}
            className={[
              "group relative flex-1 rounded-none text-center font-extrabold tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 transition",
              "h-[56px] sm:h-[60px]",
              tab === "search"
                ? "text-white"
                : "text-[#1F2937]"
            ].join(" ")}
          >
            {/* 紙 */}
            <span className="absolute inset-0 rounded-none bg-[#CFE4F7] z-0" aria-hidden />
            {/* アクティブの濃青キャップ（非選択時は透明） */}
            <span
              className={[
                "absolute inset-0 rounded-none border",
                tab === "search"
                  ? "bg-[#2C76A6] border-[#2F7CC0] shadow-[0_4px_0_0_rgba(47,124,192,0.25)] z-10"
                  : "bg-transparent border-transparent shadow-none z-0"
              ].join(" ")}
              aria-hidden
            />
            <span className="relative z-10 inline-flex h-full items-center justify-center gap-2 px-6">
              <SearchIcon className={tab === "search" ? "h-5 w-5 text-white" : "h-5 w-5 text-[#196AA6]"} />
              ニーズを探す
            </span>
          </button>

          {/* ニーズを投稿 */}
          <button
            role="tab"
            id={ids.post + "-tab"}
            aria-controls={ids.post + "-panel"}
            aria-selected={tab === "post"}
            onClick={() => setTab("post")}
            className={[
              "group relative flex-1 rounded-none text-center font-extrabold tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 transition",
              "h-[56px] sm:h-[60px]",
              tab === "post"
                ? "text-white"
                : "text-[#1F2937]"
            ].join(" ")}
          >
            <span className="absolute inset-0 rounded-none bg-[#CFE4F7] z-0" aria-hidden />
            <span
              className={[
                "absolute inset-0 rounded-none border",
                tab === "post"
                  ? "bg-[#2C76A6] border-[#2F7CC0] shadow-[0_4px_0_0_rgba(47,124,192,0.25)] z-10"
                  : "bg-transparent border-transparent shadow-none z-0"
              ].join(" ")}
              aria-hidden
            />
            <span className="relative z-10 inline-flex h-full items-center justify-center gap-2 px-6">
              <Plus className={tab === "post" ? "h-5 w-5 text-white" : "h-5 w-5 text-[#196AA6]"} />
              ニーズを投稿する
            </span>
          </button>
        </div>
      </div>

      {/* タブパネル */}
      <div
        role="tabpanel"
        id={ids.search + "-panel"}
        aria-labelledby={ids.search + "-tab"}
        hidden={tab !== "search"}
        className="mt-3"
      >
        {/* 検索フォーム本体 */}
        <div className="rounded-2xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] p-4 sm:p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center bg-white rounded-xl border border-slate-200 px-3.5 py-2.5">
                <svg className="w-4 h-4 text-[#196AA6] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <select 
                  className="flex-1 outline-none"
                  value={searchQuery.area}
                  onChange={(e) => setSearchQuery(prev => ({ ...prev, area: e.target.value }))}
                >
                  <option value="">エリアを選択</option>
                  <option value="東京都">東京都</option>
                  <option value="大阪府">大阪府</option>
                  <option value="愛知県">愛知県</option>
                  <option value="福島県">福島県</option>
                  <option value="その他">その他</option>
                </select>
              </div>
              
              <div className="flex items-center bg-white rounded-xl border border-slate-200 px-3.5 py-2.5">
                <svg className="w-4 h-4 text-[#196AA6] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
                <select 
                  className="flex-1 outline-none"
                  value={searchQuery.category}
                  onChange={(e) => setSearchQuery(prev => ({ ...prev, category: e.target.value }))}
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
            
            <div className="flex items-center bg-white rounded-xl border border-slate-200 px-3.5 py-2.5">
              <input
                type="text"
                placeholder="キーワード（例：Webサイト制作、デザイン…）"
                className="flex-1 outline-none placeholder-gray-400"
                value={searchQuery.keyword}
                onChange={(e) => setSearchQuery(prev => ({ ...prev, keyword: e.target.value }))}
              />
              <button type="submit" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded">
                <SearchIcon className="w-5 h-5 text-[#196AA6]" />
              </button>
            </div>
            
            <div className="pt-2">
              <button type="submit" className="bg-[#0B5FA6] text-white rounded-lg px-6 py-2 font-semibold flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 hover:bg-[#094A85]">
                <SearchIcon className="w-5 h-5 mr-2" />
                検索する
              </button>
            </div>
          </form>
        </div>
      </div>

      <div
        role="tabpanel"
        id={ids.post + "-panel"}
        aria-labelledby={ids.post + "-tab"}
        hidden={tab !== "post"}
        className="mt-3"
      >
        <div className="rounded-2xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] p-6 flex items-center justify-center">
          <a href="/needs/new" className="inline-flex items-center gap-2 rounded-xl bg-[#0B5FA6] px-6 py-3 font-semibold text-white">
            <Plus className="h-5 w-5" />
            ニーズを投稿する
          </a>
        </div>
      </div>
    </section>
  );
}
