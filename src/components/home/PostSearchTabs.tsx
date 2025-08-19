'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PostSearchTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'post' | 'search'>('post');

  useEffect(() => {
    const tab = searchParams.get('tab') as 'post' | 'search';
    if (tab === 'post' || tab === 'search') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'post' | 'search') => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <section className="mx-auto max-w-6xl px-6">
      <div className="flex rounded-lg bg-gray-100 p-1" role="tablist">
        <button
          onClick={() => handleTabChange('post')}
          className={`flex-1 rounded-md px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'post'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          role="tab"
          aria-selected={activeTab === 'post'}
          aria-controls="post-panel"
        >
          <svg className="mr-2 h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          投稿する
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
          探す
        </button>
      </div>
    </section>
  );
}
