"use client";
import { useState } from "react";
import Link from "next/link";

export default function FukushimaSwitch() {
  const [mode, setMode] = useState<"search"|"post">("search");
  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid md:grid-cols-2 gap-8">
        {/* 左：探す（スカイ） */}
        <div className={`rounded-2xl ring-1 p-6 md:p-8 transition
          ${mode==="search" ? "bg-[#e9f3ff] ring-[#b7d7ff]" : "bg-slate-100 ring-slate-200"}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">企業/自治体のニーズを探す</h2>
            <button onClick={()=>setMode("search")}
              className={`px-3 py-1 rounded-full text-sm
              ${mode==="search" ? "bg-white text-sky-800 ring-1 ring-[#b7d7ff]" : "bg-white/60 text-slate-600 ring-1 ring-slate-200"}`}>
              この面を表示
            </button>
          </div>

          {mode==="search" ? (
            <form action="/needs" className="mt-6 space-y-3">
              <input name="q" className="w-full rounded-md border px-3 py-2" placeholder="キーワード" />
              <div className="grid grid-cols-2 gap-3">
                <select name="city" className="rounded-md border px-3 py-2"><option>市町村</option></select>
                <select name="category" className="rounded-md border px-3 py-2"><option>カテゴリ</option></select>
              </div>
              <select name="sort" className="rounded-md border px-3 py-2"><option value="latest">新着順</option></select>
              <button className="w-full bg-sky-600 text-white rounded-md py-2">検索</button>
              <div className="mt-2 text-xs text-slate-500">※入力すると /needs に遷移して検索を実行します。</div>
            </form>
          ) : (
            <div className="mt-6 text-slate-600 text-sm">「この面を表示」を押すと検索フォームが現れます。</div>
          )}
        </div>

        {/* 右：投稿（エメラルド） */}
        <div className={`rounded-2xl ring-1 p-6 md:p-8 transition
          ${mode==="post" ? "bg-[#e7fff2] ring-[#a9f0cb]" : "bg-slate-100 ring-slate-200"}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">ニーズを投稿</h2>
            <button onClick={()=>setMode("post")}
              className={`px-3 py-1 rounded-full text-sm
              ${mode==="post" ? "bg-white text-emerald-800 ring-1 ring-[#a9f0cb]" : "bg-white/60 text-slate-600 ring-1 ring-slate-200"}`}>
              この面を表示
            </button>
          </div>

          {mode==="post" ? (
            <form action="/post" className="mt-6 space-y-3">
              <input name="title" className="w-full rounded-md border px-3 py-2" placeholder="まずは件名だけでもOK" />
              <button className="w-full bg-emerald-600 text-white rounded-md py-2">投稿をはじめる</button>
              <p className="mt-2 text-xs text-slate-500">詳細は次の画面で入力できます。</p>
              <p className="text-xs text-slate-500">投稿前のご相談は <Link className="text-emerald-700 underline" href="/support">無料相談</Link> へ。</p>
            </form>
          ) : (
            <div className="mt-6 text-slate-600 text-sm">「この面を表示」を押すと投稿フォームが現れます。</div>
          )}
        </div>
      </div>
    </div>
  );
}
