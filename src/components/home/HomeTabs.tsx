"use client";
import { useState } from "react";
import Link from "next/link";

export default function HomeTabs() {
  const [tab, setTab] = useState<"search"|"post">("search");
  const Active = tab === "search";

  return (
    <section className="max-w-6xl mx-auto px-4">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Search */}
        <div className={`rounded-xl p-5 md:p-6 ${Active ? "bg-sky-50 ring-1 ring-sky-200" : "bg-slate-100"}`}>
          <button onClick={()=>setTab("search")} className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sky-800 bg-white ring-1 ring-sky-200">
            企業/自治体のニーズを探す
          </button>
          {tab==="search" ? (
            <form action="/needs" className="space-y-3">
              <input name="q" placeholder="キーワード" className="w-full rounded-md border px-3 py-2" />
              <div className="grid grid-cols-2 gap-3">
                <select name="city" className="rounded-md border px-3 py-2"><option>市町村</option></select>
                <select name="category" className="rounded-md border px-3 py-2"><option>カテゴリ</option></select>
              </div>
              <select name="sort" className="rounded-md border px-3 py-2"><option value="latest">新着順</option></select>
              <button className="w-full bg-sky-600 text-white rounded-md py-2">検索</button>
            </form>
          ) : (
            <div className="text-slate-500">「ニーズを探す」を選ぶと検索フォームが表示されます。</div>
          )}
        </div>

        {/* Post */}
        <div className={`${!Active ? "bg-emerald-50 ring-1 ring-emerald-200" : "bg-slate-100"} rounded-xl p-5 md:p-6`}>
          <button onClick={()=>setTab("post")} className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-emerald-800 bg-white ring-1 ring-emerald-200">
            ニーズを投稿
          </button>
          {tab==="post" ? (
            <form action="/post" className="space-y-3">
              <input name="title" placeholder="まずは件名だけでもOK" className="w-full rounded-md border px-3 py-2" />
              <button className="w-full bg-emerald-600 text-white rounded-md py-2">投稿をはじめる</button>
              <div className="text-xs text-slate-500">詳細は次の画面で入力できます。</div>
            </form>
          ) : (
            <div className="text-slate-500">「ニーズを投稿」を選ぶと投稿フォームが表示されます。</div>
          )}
        </div>
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
