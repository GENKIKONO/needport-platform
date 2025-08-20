'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// 高知県市町村リスト
const KOCHI_MUNICIPALITIES = [
  '高知市', '室戸市', '安芸市', '南国市', '土佐市', '須崎市', '宿毛市', '土佐清水市', '四万十市', '香南市', '香美市',
  '東洋町', '奈半利町', '田野町', '安田町', '北川村', '馬路村', '芸西村', '本山町', '大豊町', '土佐町', '大川村',
  'いの町', '仁淀川町', '中土佐町', '佐川町', '越知町', '梼原町', '日高村', '津野町', '四万十町', '大月町', '三原村', '黒潮町'
];

// カテゴリリスト
const CATEGORIES = [
  'IT・システム', 'デザイン・クリエイティブ', 'マーケティング', '営業・販売', '事務・管理', '製造・技術', 'サービス', 'その他'
];

export default function HomeTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'search' | 'post'>('search');
  
  // URLパラメータからタブを取得
  useEffect(() => {
    const tab = searchParams.get('tab') as 'search' | 'post';
    if (tab === 'search' || tab === 'post') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // タブ切り替え
  const handleTabChange = (tab: 'search' | 'post') => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    router.push(`/?${params.toString()}`);
  };

  return (
    <section className="section">
      <div className="mx-auto max-w-4xl">
        {/* タブヘッダー */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => handleTabChange('search')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'search'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            role="tab"
            aria-selected={activeTab === 'search'}
          >
            ニーズを探す
          </button>
          <button
            onClick={() => handleTabChange('post')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'post'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            role="tab"
            aria-selected={activeTab === 'post'}
          >
            ニーズを投稿
          </button>
        </div>

        {/* タブコンテンツ */}
        <div className="tab-content">
          {activeTab === 'search' && <SearchTab />}
          {activeTab === 'post' && <PostTab />}
        </div>
      </div>
    </section>
  );
}

// 検索タブ
function SearchTab() {
  const [keyword, setKeyword] = useState('');
  const [region, setRegion] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('updated');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.set('q', keyword);
    if (region) params.set('region', region);
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    window.location.href = `/needs?${params.toString()}`;
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* キーワード */}
        <div className="sm:col-span-2">
          <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
            キーワード
          </label>
          <input
            type="text"
            id="keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="キーワードで探す"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 地域 */}
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
            <option value="">すべて</option>
            {KOCHI_MUNICIPALITIES.map((municipality) => (
              <option key={municipality} value={municipality}>
                {municipality}
              </option>
            ))}
          </select>
        </div>

        {/* カテゴリ */}
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
            <option value="">すべて</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 並び替え */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">並び替え:</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="updated">更新が新しい</option>
          <option value="views">閲覧が多い</option>
          <option value="supporters">賛同が多い</option>
          <option value="proposals">提案が多い</option>
        </select>
      </div>

      {/* 検索ボタン */}
      <div className="flex justify-center">
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          検索する
        </button>
      </div>
    </div>
  );
}

// 投稿タブ
function PostTab() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [region, setRegion] = useState('');

  const handleSubmit = () => {
    const params = new URLSearchParams();
    if (title) params.set('title', title);
    if (category) params.set('category', category);
    if (region) params.set('region', region);
    window.location.href = `/needs/new?${params.toString()}`;
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* タイトル */}
        <div className="sm:col-span-2">
          <label htmlFor="post-title" className="block text-sm font-medium text-gray-700 mb-1">
            タイトル
          </label>
          <input
            type="text"
            id="post-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ニーズのタイトル"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* カテゴリ */}
        <div>
          <label htmlFor="post-category" className="block text-sm font-medium text-gray-700 mb-1">
            カテゴリ
          </label>
          <select
            id="post-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">選択してください</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* 地域 */}
        <div>
          <label htmlFor="post-region" className="block text-sm font-medium text-gray-700 mb-1">
            地域
          </label>
          <select
            id="post-region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">選択してください</option>
            {KOCHI_MUNICIPALITIES.map((municipality) => (
              <option key={municipality} value={municipality}>
                {municipality}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 投稿ボタン */}
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          投稿ページへ進む
        </button>
      </div>
    </div>
  );
}
