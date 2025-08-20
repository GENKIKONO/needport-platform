"use client";
import { useState } from "react";
import Link from "next/link";

export default function DualActionPanel() {
  const [activeTab, setActiveTab] = useState<'find'|'post'>('find');
  
  const kochiCities = [
    "高知市", "香南市", "南国市", "土佐市", "須崎市", "四万十市", "宿毛市", "安芸市", "室戸市"
  ];
  
  return (
    <section className="section">
      <div className="max-w-6xl mx-auto px-4">
        {/* タブナビゲーション */}
        <div className="flex mb-0 gap-2" role="tablist">
          <button
            onClick={() => setActiveTab('find')}
            role="tab"
            aria-selected={activeTab === 'find'}
            className={`flex-1 py-2 px-6 text-center font-semibold transition-all duration-300 rounded-2xl shadow-[var(--elev-1)]
              ${activeTab === 'find' 
                ? 'bg-[var(--blue-600)] text-white' 
                : 'bg-white text-[var(--ink-700)]'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              ニーズを探す
            </div>
          </button>
          <button
            onClick={() => setActiveTab('post')}
            role="tab"
            aria-selected={activeTab === 'post'}
            className={`flex-1 py-2 px-6 text-center font-semibold transition-all duration-300 rounded-2xl shadow-[var(--elev-1)]
              ${activeTab === 'post' 
                ? 'bg-[var(--em-600)] text-white' 
                : 'bg-white text-[var(--ink-700)]'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4" />
              </svg>
              ニーズを投稿
            </div>
          </button>
        </div>

        {/* コンテンツエリア */}
        <div className={`rounded-2xl p-5 md:p-6 transition-all duration-300
          ${activeTab === 'find' ? 'bg-[var(--blue-100)] ring-1 ring-[var(--ring)]' : 'bg-[var(--em-100)] ring-1 ring-[#a9f0cb]'}`}>
          
          {activeTab === 'find' ? (
            <form action="/needs" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-2">所在地</label>
                  <select 
                    id="city"
                    name="city" 
                    className="w-full rounded-md border px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--tab-find-ac)] focus:border-[var(--tab-find-ac)]"
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
                    className="w-full rounded-md border px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--tab-find-ac)] focus:border-[var(--tab-find-ac)]"
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
                  className="w-full rounded-md border px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--tab-find-ac)] focus:border-[var(--tab-find-ac)]" 
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
                      className="px-3 py-1 bg-white text-[var(--tab-find-ac)] border border-[var(--tab-find-ac)] rounded-full text-sm hover:bg-[var(--tab-find-ac)] hover:text-white transition-colors"
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
                className="w-full bg-[var(--blue-600)] text-white rounded-xl py-3 font-semibold hover:opacity-90 transition-colors shadow-[var(--elev-1)]"
              >
                検索する
              </button>
            </form>
          ) : (
            <form action="/post" className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">タイトル簡易入力</label>
                <input 
                  id="title"
                  name="title" 
                  type="text" 
                  className="w-full rounded-md border px-3 py-2 bg-white focus:ring-2 focus:ring-[var(--tab-post-ac)] focus:border-[var(--tab-post-ac)]" 
                  placeholder="まずは件名だけでもOK"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-[var(--em-600)] text-white rounded-xl py-3 font-semibold hover:opacity-90 transition-colors shadow-[var(--elev-1)]"
              >
                投稿をはじめる
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
