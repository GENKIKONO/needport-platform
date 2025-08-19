'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function HomeTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'create' | 'search'>('search');

  useEffect(() => {
    const tab = searchParams.get('tab') as 'create' | 'search';
    if (tab === 'create' || tab === 'search') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'create' | 'search') => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    router.replace(`/?${params.toString()}`, { scroll: false });
    
    // 計測イベント
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'tab_changed', {
        to: tab
      });
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-6">
      <div className="flex rounded-lg bg-gray-100 p-1" role="tablist">
        <button
          onClick={() => handleTabChange('create')}
          className={`flex-1 rounded-md px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'create'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          role="tab"
          aria-selected={activeTab === 'create'}
          aria-controls="create-panel"
        >
          <svg className="mr-2 h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          ニーズを投稿
        </button>
        <button
          onClick={() => handleTabChange('search')}
          className={`flex-1 rounded-md px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'search'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          role="tab"
          aria-selected={activeTab === 'search'}
          aria-controls="search-panel"
        >
          <svg className="mr-2 h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          ニーズを探す
        </button>
      </div>

      {/* タブコンテンツ */}
      <div className="mt-6">
        {activeTab === 'create' && (
          <div id="create-panel" role="tabpanel" aria-labelledby="create-tab">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">ニーズを投稿する</h2>
              <p className="text-gray-600 mb-6">
                あなたの「欲しい」を投稿して、共感する人や事業者とつながりましょう。
              </p>
              <Link
                href="/needs/new"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                投稿を始める
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div id="search-panel" role="tabpanel" aria-labelledby="search-tab">
            <SearchPanel />
          </div>
        )}
      </div>
    </section>
  );
}

// 検索パネルコンポーネント（既存のSearchPanelを再利用）
function SearchPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState('');
  const [region, setRegion] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('updated');

  useEffect(() => {
    setKeyword(searchParams.get('q') || '');
    setRegion(searchParams.get('region') || '');
    setCategory(searchParams.get('category') || '');
    setSort(searchParams.get('sort') || 'updated');
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.set('q', keyword);
    if (region) params.set('region', region);
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    
    router.push(`/needs?${params.toString()}`);
    
    // 計測イベント
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search_submitted', {
        kw: keyword,
        city: region,
        sort: sort
      });
    }
  };

  const handleReset = () => {
    setKeyword('');
    setRegion('');
    setCategory('');
    setSort('updated');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">ニーズを探す</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* キーワード検索 */}
        <div>
          <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
            キーワード
          </label>
          <input
            type="text"
            id="keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="ニーズのタイトルや内容"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 地域フィルタ */}
        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
            地域
          </label>
          <select
            id="region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">すべての地域</option>
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

        {/* カテゴリフィルタ */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            カテゴリ
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">すべてのカテゴリ</option>
            <option value="生活">生活</option>
            <option value="子育て">子育て</option>
            <option value="高齢者">高齢者</option>
            <option value="交通">交通</option>
            <option value="環境">環境</option>
            <option value="文化">文化</option>
            <option value="その他">その他</option>
          </select>
        </div>

        {/* 並び替え */}
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
            並び替え
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="updated">更新順</option>
            <option value="views">閲覧数</option>
            <option value="supporters">賛同数</option>
            <option value="proposals">提案数</option>
          </select>
        </div>
      </div>

      {/* ボタン */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSearch}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <svg className="h-4 w-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          検索
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          リセット
        </button>
      </div>
    </div>
  );
}
