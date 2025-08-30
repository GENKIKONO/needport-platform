'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { u } from '@/components/ui/u';

interface RecentlyViewedNeed {
  id: string;
  title: string;
  viewedAt: string;
}

interface SidebarProps {
  needs: any[]; // 現在のニーズ一覧から人気カテゴリを抽出
}

export default function Sidebar({ needs }: SidebarProps) {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedNeed[]>([]);

  // 人気カテゴリを抽出（タグの出現回数をカウント）
  const getPopularCategories = () => {
    const tagCounts: { [key: string]: number } = {};
    
    needs.forEach(need => {
      need.tags?.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
  };

  // 最近見たニーズを取得
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentlyViewedNeeds');
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentlyViewed(parsed.slice(0, 5)); // 最新5件
      }
    } catch (error) {
      console.warn('Failed to load recently viewed needs:', error);
    }
  }, []);

  const popularCategories = getPopularCategories();

  return (
    <div className="space-y-6">
      {/* 人気カテゴリ */}
      <div className={`${u.card} ${u.cardPad}`}>
        <h3 className="text-lg font-semibold text-[var(--c-text)] mb-4">
          人気カテゴリ
        </h3>
        {popularCategories.length > 0 ? (
          <div className="space-y-2">
            {popularCategories.map(({ tag, count }) => (
              <Link
                key={tag}
                href={`/needs?category=${encodeURIComponent(tag)}`}
                className={`block p-2 rounded-md hover:bg-[var(--c-blue-bg)] transition-colors ${u.focus}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[var(--c-text)]">{tag}</span>
                  <span className="text-sm text-[var(--c-text-muted)]">{count}件</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-[var(--c-text-muted)] text-sm">
            まだカテゴリがありません
          </p>
        )}
      </div>

      {/* 最近見たニーズ */}
      <div className={`${u.card} ${u.cardPad}`}>
        <h3 className="text-lg font-semibold text-[var(--c-text)] mb-4">
          最近見たニーズ
        </h3>
        {recentlyViewed.length > 0 ? (
          <div className="space-y-3">
            {recentlyViewed.map((need) => (
              <Link
                key={need.id}
                href={`/needs/${need.id}`}
                className={`block p-3 rounded-md hover:bg-[var(--c-blue-bg)] transition-colors ${u.focus}`}
              >
                <h4 className="text-sm font-medium text-[var(--c-text)] line-clamp-2 mb-1">
                  {need.title}
                </h4>
                <p className="text-xs text-[var(--c-text-muted)]">
                  {new Date(need.viewedAt).toLocaleDateString('ja-JP')}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-[var(--c-text-muted)] text-sm">
            まだ見たニーズがありません
          </p>
        )}
      </div>

      {/* 注意書き */}
      <div className={`${u.card} ${u.cardPad} bg-[var(--c-blue-bg)] border-[var(--c-blue)]`}>
        <h3 className="text-sm font-medium text-[var(--c-blue-strong)] mb-2">
          ご利用にあたって
        </h3>
        <p className="text-xs text-[var(--c-blue)] leading-relaxed">
          投稿されたニーズの内容や連絡先の正確性については、投稿者に責任があります。
          取引や連絡の際は十分ご注意ください。
        </p>
      </div>
    </div>
  );
}
