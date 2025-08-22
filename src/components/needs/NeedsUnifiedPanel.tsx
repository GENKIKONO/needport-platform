"use client";
import { useState, useId, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, Plus, MapPin } from "lucide-react";
import { CATEGORIES } from "@/constants/master";
import { KOCHI_AREAS, AREA_ETC } from "@/constants/kochi-areas";
import PageContainer from "@/components/layout/PageContainer";

export default function NeedsUnifiedPanel() {
  const router = useRouter();
  const [tab, setTab] = useState<"search" | "post">("search");
  const ids = { search: useId(), post: useId() };
  const listRef = useRef<HTMLDivElement>(null);

  // Search tab state
  const [area, setArea] = useState<string>("");
  const [areaEtc, setAreaEtc] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");

  // Post tab state
  const [title, setTitle] = useState<string>("");
  const [desc, setDesc] = useState<string>("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    const selectedArea = area === AREA_ETC ? areaEtc.trim() : area;
    if (selectedArea) params.set("area", selectedArea);
    if (category) params.set("category", category);
    if (keyword) params.set("q", keyword);
    router.push(`/needs?${params.toString()}`);
  };

  const handlePostContinue = () => {
    const params = new URLSearchParams();
    if (title) params.set("title", encodeURIComponent(title));
    if (desc) params.set("desc", encodeURIComponent(desc));
    router.push(`/needs/new?${params.toString()}`);
  };

  // キーボードナビゲーション
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!listRef.current) return;
      
      const tabs = Array.from(listRef.current.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
      const currentIndex = tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
          tabs[prevIndex]?.click();
          break;
        case 'ArrowRight':
          e.preventDefault();
          const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
          tabs[nextIndex]?.click();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          tabs[currentIndex]?.click();
          break;
      }
    };

    const listElement = listRef.current;
    if (listElement) {
      listElement.addEventListener('keydown', handleKeyDown);
      return () => listElement.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  return (
    <section className="relative w-full bg-[#CFE4F7]">
      <PageContainer className="py-4 sm:py-6">

          {/* タブ（選択=板と同色で溶ける／非選択=濃青キャップ） */}
          <div ref={listRef} role="tablist" aria-label="ニーズ操作" className="flex gap-8">
            {/* ニーズを探す */}
            <button
              role="tab"
              id={ids.search + "-tab"}
              aria-controls={ids.search + "-panel"}
              aria-selected={tab === "search"}
              onClick={() => setTab("search")}
              className="relative inline-flex items-center gap-2 h-[52px] px-16 font-extrabold tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              {/* 非選択のときだけ濃青キャップを描く */}
              {tab !== "search" && (
                <span
                  aria-hidden
                  className="absolute inset-0 -z-10 bg-[#2C76A6] border border-[#2F7CC0] shadow-[0_4px_0_0_rgba(47,124,192,0.25)]"
                />
              )}
              <SearchIcon className={tab === "search" ? "h-5 w-5 text-[#196AA6]" : "h-5 w-5 text-white"} />
              <span className={`${tab === "search" ? "text-[#1F2937]" : "text-white"} not-italic normal-case [writing-mode:horizontal-tb] whitespace-nowrap`}>ニーズを探す</span>
            </button>

            {/* ニーズを投稿する */}
            <button
              role="tab"
              id={ids.post + "-tab"}
              aria-controls={ids.post + "-panel"}
              aria-selected={tab === "post"}
              onClick={() => setTab("post")}
              className="relative inline-flex items-center gap-2 h-[52px] px-16 font-extrabold tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              {tab !== "post" && (
                <span aria-hidden className="absolute inset-0 -z-10 bg-[#2C76A6] border border-[#2F7CC0] shadow-[0_4px_0_0_rgba(47,124,192,0.25)]" />
              )}
              <Plus className={tab === "post" ? "h-5 w-5 text-[#196AA6]" : "h-5 w-5 text-white"} />
              <span className={`${tab === "post" ? "text-[#1F2937]" : "text-white"} not-italic normal-case [writing-mode:horizontal-tb] whitespace-nowrap`}>ニーズを投稿する</span>
            </button>
          </div>

          {/* 本体エリア：SURFACEの上に直接フォームを置く（白カード禁止） */}
          <div className="mt-4 sm:mt-6">
            {/* tab=search */}
            <div role="tabpanel" id={ids.search + "-panel"} aria-labelledby={ids.search + "-tab"} hidden={tab !== "search"}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center rounded-xl bg-white/70 backdrop-blur-[1px] border border-white/50 px-3.5 py-2.5 gap-2 min-w-0">
                  <svg className="h-5 w-5 text-[#196AA6] shrink-0" viewBox="0 0 24 24" fill="none"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" stroke="currentColor" strokeWidth="1.8"/></svg>
                  <select
                    value={area}
                    onChange={(e) => { setArea(e.target.value); if (e.target.value !== AREA_ETC) setAreaEtc(""); }}
                    className="flex-1 bg-transparent outline-none text-[#1F2937] min-w-0"
                  >
                    <option value="">エリアを選択</option>
                    {KOCHI_AREAS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                    <option value={AREA_ETC}>{AREA_ETC}</option>
                  </select>
                </label>
                <label className="flex items-center rounded-xl bg-white/70 backdrop-blur-[1px] border border-white/50 px-3.5 py-2.5 gap-2 min-w-0">
                  <svg className="h-5 w-5 text-[#196AA6] shrink-0" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2"/></svg>
                  <select 
                    value={category} 
                    onChange={e => setCategory(e.target.value)} 
                    className="flex-1 bg-transparent outline-none text-[#1F2937] min-w-0"
                  >
                    <option value="">カテゴリを選択</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
              </div>

              {/* その他が選ばれたら自由入力を出す */}
              {area === AREA_ETC && (
                <input
                  value={areaEtc}
                  onChange={(e) => setAreaEtc(e.target.value)}
                  placeholder="エリアを入力（例：〇〇地区、△△周辺 など）"
                  className="mt-3 w-full rounded-xl bg-white/70 border border-white/50 px-4 py-2.5 outline-none placeholder:text-slate-500"
                />
              )}

              <div className="mt-3 flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder="キーワード（例：Webサイト制作、デザイン…）"
                  className="flex-1 rounded-xl bg-white/70 border border-white/50 px-4 py-2.5 outline-none placeholder:text-slate-500 min-w-0"
                />
                <button 
                  disabled={area === AREA_ETC && areaEtc.trim() === ""}
                  onClick={handleSearch}
                  className={
                    "inline-flex items-center justify-center gap-2 rounded-xl h-12 px-6 font-semibold " +
                    (area === AREA_ETC && areaEtc.trim() === "" ? "bg-[#9fb9d1] text-white/80 cursor-not-allowed" : "bg-[#0B5FA6] text-white")
                  }
                >
                  <SearchIcon className="h-5 w-5" />
                  検索する
                </button>
              </div>
            </div>

            {/* tab=post */}
            <div role="tabpanel" id={ids.post + "-panel"} aria-labelledby={ids.post + "-tab"} hidden={tab !== "post"}>
              <div className="space-y-3">
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="タイトル（必須）"
                  className="w-full rounded-xl bg-white/70 border border-white/50 px-4 py-2.5 outline-none"
                />
                <textarea
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="内容（任意）"
                  rows={3}
                  className="w-full rounded-xl bg-white/70 border border-white/50 px-4 py-2.5 outline-none resize-none"
                />
                <div className="flex gap-3">
                  <a href="/needs/new" className="inline-flex items-center gap-2 rounded-xl bg-[#0B5FA6] text-white h-12 px-6 font-semibold">
                    新規投稿ページで詳細入力
                  </a>
                  <button
                    onClick={handlePostContinue}
                    className="rounded-xl bg-[#0B5FA6] text-white h-12 px-6 font-semibold"
                  >
                    この内容で続行
                  </button>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
    );
  }
