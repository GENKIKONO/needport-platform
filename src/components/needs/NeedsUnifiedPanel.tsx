"use client";
import { useState, useId } from "react";
import { Search as SearchIcon, Plus, MapPin } from "lucide-react";

export default function NeedsUnifiedPanel() {
  const [tab, setTab] = useState<"search" | "post">("search");
  const ids = { search: useId(), post: useId() };

  return (
    <section className="relative w-full">
      {/* 一枚板のSURFACE */}
      <div className="relative w-full bg-[#CFE4F7]">
        {/* 内側の最大幅と余白だけ制御（板はフルブリード） */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 sm:py-6">

          {/* タブ（選択=板と同色で溶ける／非選択=濃青キャップ） */}
          <div role="tablist" aria-label="ニーズ操作" className="flex gap-8">
            {/* ニーズを探す */}
            <button
              role="tab"
              id={ids.search + "-tab"}
              aria-controls={ids.search + "-panel"}
              aria-selected={tab === "search"}
              onClick={() => setTab("search")}
              className="relative inline-flex items-center gap-2 h-[52px] px-16 font-extrabold tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              {/* 選択時=サーフェスと同色 → 何も被せない。非選択時のみ濃青キャップをかぶせる */}
              {tab !== "search" && (
                <span
                  aria-hidden
                  className="absolute inset-0 -z-10 bg-[#2C76A6] border border-[#2F7CC0] shadow-[0_4px_0_0_rgba(47,124,192,0.25)]"
                />
              )}
              <SearchIcon className={tab === "search" ? "h-5 w-5 text-[#196AA6]" : "h-5 w-5 text-white"} />
              <span className={tab === "search" ? "text-[#1F2937]" : "text-white"}>ニーズを探す</span>
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
              <span className={tab === "post" ? "text-[#1F2937]" : "text-white"}>ニーズを投稿する</span>
            </button>
          </div>

          {/* 本体エリア：SURFACEの上に直接フォームを置く（白カード禁止） */}
          <div className="mt-4 sm:mt-6">
            {/* tab=search */}
            <div role="tabpanel" id={ids.search + "-panel"} aria-labelledby={ids.search + "-tab"} hidden={tab !== "search"}>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="flex items-center rounded-xl bg-white/70 backdrop-blur-[1px] border border-white/50 px-3.5 py-2.5">
                  <MapPin className="mr-2 h-5 w-5 text-[#196AA6]" />
                  <select className="flex-1 bg-transparent outline-none text-[#1F2937]">
                    <option>エリアを選択</option>
                  </select>
                </label>
                <label className="flex items-center rounded-xl bg-white/70 backdrop-blur-[1px] border border-white/50 px-3.5 py-2.5">
                  <svg className="mr-2 h-5 w-5 text-[#196AA6]" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2"/></svg>
                  <select className="flex-1 bg-transparent outline-none text-[#1F2937]">
                    <option>カテゴリを選択</option>
                  </select>
                </label>
              </div>

              <div className="mt-3 flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="キーワード（例：Webサイト制作、デザイン…）"
                  className="flex-1 rounded-xl bg-white/70 border border-white/50 px-4 py-2.5 outline-none placeholder:text-slate-500"
                />
                <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B5FA6] text-white h-12 px-6 font-semibold">
                  <SearchIcon className="h-5 w-5" />
                  検索する
                </button>
              </div>
            </div>

            {/* tab=post */}
            <div role="tabpanel" id={ids.post + "-panel"} aria-labelledby={ids.post + "-tab"} hidden={tab !== "post"}>
              <div className="flex items-center justify-center py-6">
                <a href="/needs/new" className="inline-flex items-center gap-2 rounded-xl bg-[#0B5FA6] text-white h-12 px-6 font-semibold">
                  <Plus className="h-5 w-5" />
                  ニーズを投稿する
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
