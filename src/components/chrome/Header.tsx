// src/components/chrome/Header.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import LeftDock from '../nav/LeftDock';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* シンプルで柔らかいトップバー */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-blue-100/50">
        <div className="mx-auto max-w-7xl h-16 px-3 sm:px-4 lg:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-3 font-bold text-slate-800 hover:text-blue-600/80 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500/90 to-blue-600/90 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <span className="text-xl">NeedPort</span>
          </Link>

          {/* 右側：PCは簡易リンク / SPはハンバーガー */}
          <div className="flex items-center gap-3">
            <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
              <Link href="/needs" className="text-slate-600 hover:text-blue-600/80 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50/50">
                ニーズ一覧
              </Link>
              <Link href="/me" className="text-slate-600 hover:text-blue-600/80 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50/50">
                マイページ
              </Link>
              <Link href="/login" className="bg-blue-500/90 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-600/90 transition-all shadow-sm">
                ログイン
              </Link>
            </nav>
            <button
              type="button"
              className="sm:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border border-slate-300"
              aria-label="メニューを開く"
              onClick={() => setOpen(true)}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* モバイルドロワー（LeftDock を流用） */}
      {open && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-xl p-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="font-semibold">メニュー</div>
              <button
                type="button"
                aria-label="閉じる"
                onClick={() => setOpen(false)}
                className="inline-flex w-9 h-9 items-center justify-center rounded-md border border-slate-300"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="pt-3">
              {/* LeftDock は ul/li/Link の集合想定。モバイルでもそのまま描画 */}
              <LeftDock />
            </div>
          </div>
        </div>
      )}
    </>
  );
}