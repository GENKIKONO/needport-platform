'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { KOCHI_MUNICIPALITIES } from '@/lib/geo/kochi';

export default function SearchPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState('');
  const [region, setRegion] = useState('');
  const [stage, setStage] = useState('');
  const [sort, setSort] = useState('updated');

  useEffect(() => {
    // URLパラメータから初期値を設定
    setKeyword(searchParams.get('q') || '');
    setRegion(searchParams.get('region') || '');
    setStage(searchParams.get('stage') || '');
    setSort(searchParams.get('sort') || 'updated');
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.set('q', keyword);
    if (region) params.set('region', region);
    if (stage) params.set('stage', stage);
    if (sort) params.set('sort', sort);
    
    router.push(`/needs?${params.toString()}`);
  };

  const handleReset = () => {
    setKeyword('');
    setRegion('');
    setStage('');
    setSort('updated');
  };

  return (
    <section className="mx-auto max-w-6xl px-6" id="search-tab">
      <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
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
              {KOCHI_MUNICIPALITIES.map((municipality) => (
                <option key={municipality} value={municipality}>
                  {municipality}
                </option>
              ))}
            </select>
          </div>

          {/* ステージフィルタ */}
          <div>
            <label htmlFor="stage" className="block text-sm font-medium text-gray-700 mb-1">
              ステージ
            </label>
            <select
              id="stage"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">すべてのステージ</option>
              <option value="募集">募集</option>
              <option value="出港">出港</option>
              <option value="進行中">進行中</option>
              <option value="完了">完了</option>
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
    </section>
  );
}
