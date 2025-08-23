'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { u } from '@/components/ui/u';

interface SearchFormProps {
  value: {
    keyword: string;
    area: string;
    categories: string[];
    sort: string;
  };
  onChange: (value: any) => void;
}

const AREAS = [
  { value: '', label: 'すべてのエリア' },
  { value: 'tokyo', label: '東京都' },
  { value: 'osaka', label: '大阪府' },
  { value: 'kyoto', label: '京都府' },
  { value: 'hokkaido', label: '北海道' },
  { value: 'fukushima', label: '福島県' },
  { value: 'other', label: 'その他' }
];

const CATEGORIES = [
  { value: 'business', label: 'ビジネス' },
  { value: 'community', label: 'コミュニティ' },
  { value: 'education', label: '教育' },
  { value: 'environment', label: '環境' },
  { value: 'health', label: '健康・医療' },
  { value: 'technology', label: 'テクノロジー' },
  { value: 'other', label: 'その他' }
];

const SORT_OPTIONS = [
  { value: 'recent', label: '新着順' },
  { value: 'popular', label: '人気順' },
  { value: 'deadline', label: '締切順' }
];

export default function SearchForm({ value, onChange }: SearchFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    // 検索条件をURLに反映
    if (value.keyword) params.set('keyword', value.keyword);
    else params.delete('keyword');
    
    if (value.area) params.set('area', value.area);
    else params.delete('area');
    
    if (value.categories.length > 0) params.set('categories', value.categories.join(','));
    else params.delete('categories');
    
    if (value.sort) params.set('sort', value.sort);
    else params.delete('sort');
    
    params.set('page', '1'); // 検索時は1ページ目に戻る
    
    router.push(`/needs?${params.toString()}`);
  };

  const handleReset = () => {
    onChange({
      keyword: '',
      area: '',
      categories: [],
      sort: 'recent'
    });
    router.push('/needs');
  };

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* PC: 横並びレイアウト */}
        <div className="hidden lg:flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="keyword" className="block text-sm font-medium text-[var(--c-text)] mb-1">
              キーワード
            </label>
            <input
              id="keyword"
              type="text"
              value={value.keyword}
              onChange={(e) => onChange({ ...value, keyword: e.target.value })}
              placeholder="ニーズを検索..."
              className={`w-full px-3 py-2 border border-[var(--c-border)] rounded-md ${u.focus}`}
            />
          </div>
          
          <div className="w-48">
            <label htmlFor="area" className="block text-sm font-medium text-[var(--c-text)] mb-1">
              エリア
            </label>
            <select
              id="area"
              value={value.area}
              onChange={(e) => onChange({ ...value, area: e.target.value })}
              className={`w-full px-3 py-2 border border-[var(--c-border)] rounded-md ${u.focus}`}
            >
              {AREAS.map(area => (
                <option key={area.value} value={area.value}>
                  {area.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="w-48">
            <label className="block text-sm font-medium text-[var(--c-text)] mb-1">
              カテゴリ
            </label>
            <div className="border border-[var(--c-border)] rounded-md p-2 max-h-32 overflow-y-auto bg-white">
              {CATEGORIES.map(category => (
                <label key={category.value} className="flex items-center text-sm py-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value.categories.includes(category.value)}
                    onChange={(e) => {
                      const newCategories = e.target.checked
                        ? [...value.categories, category.value]
                        : value.categories.filter(c => c !== category.value);
                      onChange({ ...value, categories: newCategories });
                    }}
                    className="mr-2"
                  />
                  {category.label}
                </label>
              ))}
            </div>
          </div>
          
          <div className="w-48">
            <label htmlFor="sort" className="block text-sm font-medium text-[var(--c-text)] mb-1">
              並び順
            </label>
            <select
              id="sort"
              value={value.sort}
              onChange={(e) => onChange({ ...value, sort: e.target.value })}
              className={`w-full px-3 py-2 border border-[var(--c-border)] rounded-md ${u.focus}`}
            >
              {SORT_OPTIONS.map(sort => (
                <option key={sort.value} value={sort.value}>
                  {sort.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              className={`${u.btn} ${u.btnPrimary} ${u.focus}`}
            >
              検索
            </button>
            <button
              type="button"
              onClick={handleReset}
              className={`${u.btn} ${u.btnGhost} ${u.focus}`}
            >
              リセット
            </button>
          </div>
        </div>

        {/* SP: アコーディオン形式 */}
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-full ${u.btn} ${u.btnOutline} ${u.focus} flex items-center justify-between`}
          >
            <span>検索・絞り込み</span>
            <svg
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isExpanded && (
            <div className="mt-4 space-y-4 p-4 border border-[var(--c-border)] rounded-md bg-[var(--c-bg-secondary)]">
              <div>
                <label htmlFor="keyword-mobile" className="block text-sm font-medium text-[var(--c-text)] mb-1">
                  キーワード
                </label>
                <input
                  id="keyword-mobile"
                  type="text"
                  value={value.keyword}
                  onChange={(e) => onChange({ ...value, keyword: e.target.value })}
                  placeholder="ニーズを検索..."
                  className={`w-full px-3 py-2 border border-[var(--c-border)] rounded-md ${u.focus}`}
                />
              </div>
              
              <div>
                <label htmlFor="area-mobile" className="block text-sm font-medium text-[var(--c-text)] mb-1">
                  エリア
                </label>
                <select
                  id="area-mobile"
                  value={value.area}
                  onChange={(e) => onChange({ ...value, area: e.target.value })}
                  className={`w-full px-3 py-2 border border-[var(--c-border)] rounded-md ${u.focus}`}
                >
                  {AREAS.map(area => (
                    <option key={area.value} value={area.value}>
                      {area.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--c-text)] mb-1">
                  カテゴリ
                </label>
                <div className="border border-[var(--c-border)] rounded-md p-2 max-h-32 overflow-y-auto bg-white">
                  {CATEGORIES.map(category => (
                    <label key={category.value} className="flex items-center text-sm py-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value.categories.includes(category.value)}
                        onChange={(e) => {
                          const newCategories = e.target.checked
                            ? [...value.categories, category.value]
                            : value.categories.filter(c => c !== category.value);
                          onChange({ ...value, categories: newCategories });
                        }}
                        className="mr-2"
                      />
                      {category.label}
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="sort-mobile" className="block text-sm font-medium text-[var(--c-text)] mb-1">
                  並び順
                </label>
                <select
                  id="sort-mobile"
                  value={value.sort}
                  onChange={(e) => onChange({ ...value, sort: e.target.value })}
                  className={`w-full px-3 py-2 border border-[var(--c-border)] rounded-md ${u.focus}`}
                >
                  {SORT_OPTIONS.map(sort => (
                    <option key={sort.value} value={sort.value}>
                      {sort.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className={`flex-1 ${u.btn} ${u.btnPrimary} ${u.focus}`}
                >
                  検索
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className={`flex-1 ${u.btn} ${u.btnGhost} ${u.focus}`}
                >
                  リセット
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
