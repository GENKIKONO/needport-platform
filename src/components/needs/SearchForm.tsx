'use client';

import { useEffect, useState, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { u } from '@/components/ui/u';

// デバウンス用フック
function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
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

export default function SearchForm() {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // URLパラメータから初期値を取得
  const [localValue, setLocalValue] = useState({
    keyword: searchParams.get('keyword') ?? '',
    area: searchParams.get('area') ?? '',
    categories: searchParams.get('categories') ? searchParams.get('categories')!.split(',') : [],
    sort: searchParams.get('sort') ?? 'recent'
  });

  // デバウンスされたキーワード
  const dq = useDebounced(localValue.keyword, 350);

  // URL→フォームの一方向同期（戻る操作など）
  useEffect(() => {
    setLocalValue({
      keyword: searchParams.get('keyword') ?? '',
      area: searchParams.get('area') ?? '',
      categories: searchParams.get('categories') ? searchParams.get('categories')!.split(',') : [],
      sort: searchParams.get('sort') ?? 'recent'
    });
  }, [searchParams]);

  // デバウンスされたキーワードで検索実行
  useEffect(() => {
    if (dq !== localValue.keyword) {
      // キーワードが変更された場合の処理（必要に応じて実装）
    }
  }, [dq, localValue.keyword]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    // 検索条件をURLに反映
    if (localValue.keyword) params.set('keyword', localValue.keyword);
    else params.delete('keyword');
    
    if (localValue.area) params.set('area', localValue.area);
    else params.delete('area');
    
    if (localValue.categories.length > 0) params.set('categories', localValue.categories.join(','));
    else params.delete('categories');
    
    if (localValue.sort) params.set('sort', localValue.sort);
    else params.delete('sort');
    
    params.set('page', '1'); // 検索時は1ページ目に戻る
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    setLocalValue({
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
              value={localValue.keyword}
              onChange={(e) => setLocalValue({ ...localValue, keyword: e.target.value })}
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
              value={localValue.area}
              onChange={(e) => setLocalValue({ ...localValue, area: e.target.value })}
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
                    checked={localValue.categories.includes(category.value)}
                    onChange={(e) => {
                      const newCategories = e.target.checked
                        ? [...localValue.categories, category.value]
                        : localValue.categories.filter(c => c !== category.value);
                      setLocalValue({ ...localValue, categories: newCategories });
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
              value={localValue.sort}
              onChange={(e) => setLocalValue({ ...localValue, sort: e.target.value })}
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
                  value={localValue.keyword}
                  onChange={(e) => setLocalValue({ ...localValue, keyword: e.target.value })}
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
                  value={localValue.area}
                  onChange={(e) => setLocalValue({ ...localValue, area: e.target.value })}
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
                        checked={localValue.categories.includes(category.value)}
                        onChange={(e) => {
                          const newCategories = e.target.checked
                            ? [...localValue.categories, category.value]
                            : localValue.categories.filter(c => c !== category.value);
                          setLocalValue({ ...localValue, categories: newCategories });
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
                  value={localValue.sort}
                  onChange={(e) => setLocalValue({ ...localValue, sort: e.target.value })}
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
