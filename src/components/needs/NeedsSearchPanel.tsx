"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon as SearchIcon, PlusIcon } from "@/components/icons";
import { tabActive, tabInactive, tabBase, barBg, barPaper, searchButton, formCard, iconColor } from "@/components/ui/tabStyles";

interface NeedsSearchPanelProps {
  defaultTab?: "search" | "post";
  className?: string;
}

export default function NeedsSearchPanel({
  defaultTab = "search",
  className = ""
}: NeedsSearchPanelProps) {
  const [activeTab, setActiveTab] = useState<"search" | "post">(defaultTab);
  const [searchQuery, setSearchQuery] = useState({
    area: "",
    category: "",
    keyword: ""
  });
  const tabsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleTabChange = useCallback((newTab: "search" | "post") => {
    setActiveTab(newTab);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, currentTab: "search" | "post") => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const newTab = currentTab === 'search' ? 'post' : 'search';
      setActiveTab(newTab);
      const newTabElement = tabsRef.current?.querySelector(`button[data-tab="${newTab}"]`) as HTMLButtonElement;
      newTabElement?.focus();
    }
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.area) params.set('area', searchQuery.area);
    if (searchQuery.category) params.set('category', searchQuery.category);
    if (searchQuery.keyword) params.set('q', searchQuery.keyword);
    
    router.push(`/needs${params.toString() ? `?${params.toString()}` : ''}`);
  }, [searchQuery, router]);

  const handlePost = useCallback(() => {
    router.push('/needs/new');
  }, [router]);

  const tabs = [
    { key: 'search' as const, label: 'ニーズを探す', icon: SearchIcon },
    { key: 'post' as const, label: 'ニーズを投稿', icon: PlusIcon }
  ];

  return (
    <section className={`${barBg} pb-6 ${className}`}>
      {/* タブ */}
      <div className="relative max-w-4xl mx-auto pt-6 px-4">
        {/* 付箋の土台（背面の"紙"） */}
        <div className={barPaper} aria-hidden="true" />
        
        <div 
          ref={tabsRef}
          role="tablist"
          aria-label="ニーズ操作"
          className="relative flex gap-2 sm:flex-row flex-col"
        >
          {tabs.map(({ key, label, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                data-tab={key}
                role="tab"
                id={`needs-tab-${key}`}
                aria-controls={`needs-panel-${key}`}
                aria-selected={isActive}
                onClick={() => handleTabChange(key)}
                onKeyDown={(e) => handleKeyDown(e, key)}
                className={`${tabBase} flex-1 ${
                  isActive ? tabActive : tabInactive
                }`}
              >
                <Icon className={`w-5 h-5 mr-2 ${isActive ? iconColor : 'text-white'}`} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* フォーム */}
      <div className="max-w-4xl mx-auto mt-4 px-4">
        <div className={formCard}>
          {activeTab === 'search' ? (
            <div
              role="tabpanel"
              id="needs-panel-search"
              aria-labelledby="needs-tab-search"
            >
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center bg-white rounded-xl border border-slate-200 px-3.5 py-2.5">
                    <svg className={`w-4 h-4 ${iconColor} mr-2 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <svg className={`w-4 h-4 ${iconColor} mr-2 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <SearchIcon className={`w-5 h-5 ${iconColor}`} />
                  </button>
                </div>
                
                <div className="pt-2">
                  <button type="submit" className={searchButton}>
                    <SearchIcon className="w-5 h-5 mr-2" />
                    検索する
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div
              role="tabpanel"
              id="needs-panel-post"
              aria-labelledby="needs-tab-post"
            >
              <div className="text-center py-8">
                <div className="mb-6">
                  <PlusIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">ニーズを投稿</h3>
                  <p className="text-gray-600">あなたのプロジェクトや課題を投稿して、最適なパートナーを見つけましょう</p>
                </div>
                <button 
                  onClick={handlePost}
                  className="bg-[#0B5FA6] text-white rounded-xl px-8 py-4 font-semibold text-lg hover:bg-[#094A85] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  投稿をはじめる
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
