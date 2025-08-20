"use client";
import { useState } from "react";
import Link from "next/link";

export default function DualActionPanel() {
  const [activeTab, setActiveTab] = useState<'find'|'post'>('find');
  
  return (
    <section className="section">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          {/* 左：ニーズを探す */}
          <div className={`rounded-2xl ring-1 p-6 md:p-8 transition-all duration-300
            ${activeTab==="find" ? "bg-[var(--tab-find-bg)] ring-[var(--tab-find-active)]" : "bg-slate-100 ring-slate-200"}`}>
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">ニーズを探す</h2>
              <button 
                onClick={() => setActiveTab('find')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all
                  ${activeTab==="find" 
                    ? "bg-white text-[var(--tab-find-active)] ring-1 ring-[var(--tab-find-active)] shadow-sm" 
                    : "bg-white/60 text-slate-600 ring-1 ring-slate-200"}`}
              >
                この面を表示
              </button>
            </div>

            {activeTab==="find" ? (
              <form action="/needs" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">所在地</label>
                  <select name="city" className="w-full rounded-md border px-3 py-2 bg-white">
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">カテゴリ</label>
                  <select name="category" className="w-full rounded-md border px-3 py-2 bg-white">
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
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">キーワード</label>
                  <input 
                    name="q" 
                    type="text" 
                    className="w-full rounded-md border px-3 py-2 bg-white" 
                    placeholder="例：Webサイト制作、デザイン、システム開発"
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-[var(--tab-find-active)] text-white rounded-md py-3 font-medium hover:opacity-90 transition-colors"
                >
                  検索する
                </button>
              </form>
            ) : (
              <div className="text-slate-600 text-sm">
                「この面を表示」を押すと検索フォームが現れます。
              </div>
            )}
          </div>

          {/* 右：ニーズを投稿 */}
          <div className={`rounded-2xl ring-1 p-6 md:p-8 transition-all duration-300
            ${activeTab==="post" ? "bg-[var(--tab-post-bg)] ring-[var(--tab-post-active)]" : "bg-slate-100 ring-slate-200"}`}>
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">ニーズを投稿</h2>
              <button 
                onClick={() => setActiveTab('post')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all
                  ${activeTab==="post" 
                    ? "bg-white text-[var(--tab-post-active)] ring-1 ring-[var(--tab-post-active)] shadow-sm" 
                    : "bg-white/60 text-slate-600 ring-1 ring-slate-200"}`}
              >
                この面を表示
              </button>
            </div>

            {activeTab==="post" ? (
              <form action="/post" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">タイトル</label>
                  <input 
                    name="title" 
                    type="text" 
                    className="w-full rounded-md border px-3 py-2 bg-white" 
                    placeholder="まずは件名だけでもOK"
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-[var(--tab-post-active)] text-white rounded-md py-3 font-medium hover:opacity-90 transition-colors"
                >
                  投稿をはじめる
                </button>
              </form>
            ) : (
              <div className="text-slate-600 text-sm">
                「この面を表示」を押すと投稿フォームが現れます。
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
