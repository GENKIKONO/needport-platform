"use client";
import { useState } from "react";

type Mode = "search" | "post";

export default function HomeTabs() {
  const [mode, setMode] = useState<Mode>("search");

  return (
    <section className="mt-8">
      {/* 見出しタブ（大きな色ブロック） */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setMode("search")}
          aria-pressed={mode==="search"}
          className={`rounded-lg px-4 py-3 text-center font-medium border
            ${mode==="search" ? "bg-sky-600 text-white border-sky-600" : "bg-sky-50 text-sky-700 border-sky-200"}`}
        >
          ニーズを探す
        </button>
        <button
          onClick={() => setMode("post")}
          aria-pressed={mode==="post"}
          className={`rounded-lg px-4 py-3 text-center font-medium border
            ${mode==="post" ? "bg-emerald-600 text-white border-emerald-600" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}
        >
          ニーズを投稿
        </button>
      </div>

      {/* 内容ブロック */}
      <div className={`mt-4 rounded-xl border p-4 ${mode==="search" ? "bg-sky-50 border-sky-200" : "bg-emerald-50 border-emerald-200"}`}>
        {mode === "search" ? <SearchForm /> : <PostCta />}
      </div>
    </section>
  );
}

function SearchForm() {
  return (
    <form action="/needs" className="grid gap-3 md:grid-cols-2">
      <input name="q" className="input" placeholder="キーワード" />
      <select name="region" className="input">
        <option value="">地域</option>
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
      <select name="category" className="input">
        <option value="">カテゴリ</option>
        <option value="IT・システム">IT・システム</option>
        <option value="デザイン・クリエイティブ">デザイン・クリエイティブ</option>
        <option value="マーケティング">マーケティング</option>
        <option value="営業・販売">営業・販売</option>
        <option value="事務・管理">事務・管理</option>
        <option value="製造・技術">製造・技術</option>
        <option value="サービス">サービス</option>
        <option value="その他">その他</option>
      </select>
      <select name="sort" className="input">
        <option value="recent">新着順</option>
        <option value="trending">人気順</option>
      </select>
      <div className="md:col-span-2">
        <button className="rounded bg-sky-600 text-white px-4 py-2">検索する</button>
      </div>
    </form>
  );
}

function PostCta() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">かんたん入力で、地域の力を借りて実現しましょう。</p>
      <a href="/needs/new" className="inline-flex items-center rounded bg-emerald-600 text-white px-4 py-2">投稿画面へ</a>
      <p className="text-xs text-gray-500">投稿の手順は「使い方ガイド」にまとめています。</p>
    </div>
  );
}
