"use client";

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

/**
 * Quick navigation links - includes link to simple need posting
 * Can be inserted into existing navigation without breaking changes
 */
export function NavQuickLinks({ className = '' }: { className?: string }) {
  const { isSignedIn } = useUser();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isSignedIn ? (
        <Link
          href="/needs/new-simple"
          className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
          title="簡易ニーズ投稿"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">簡易投稿</span>
        </Link>
      ) : (
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
          title="ログインして投稿"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">ログイン</span>
        </Link>
      )}
    </div>
  );
}

/**
 * Simple banner for testing - can be placed anywhere in layout
 */
export function SimplePostingBanner({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-800">
            💡 新機能：簡易投稿
          </p>
          <p className="text-xs text-slate-600">
            最小限の入力でニーズを素早く投稿できます
          </p>
        </div>
        <Link
          href="/needs/new-simple"
          className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-full hover:bg-green-600 transition-colors"
        >
          試してみる
        </Link>
      </div>
    </div>
  );
}