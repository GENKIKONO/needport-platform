'use client';

import Link from 'next/link';
import { useState } from 'react';
import LeftDock from '../nav/LeftDock';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-7xl h-14 px-3 sm:px-4 lg:px-6 flex items-center justify-between">
          {/* ロゴ */}
          <Link href="/" className="inline-flex items-center gap-2 font-semibold text-slate-900">
            <span aria-hidden className="inline-block w-5 h-5 rounded-sm bg-sky-500" />
            NeedPort
          </Link>

          {/* 右：SPハンバーガー / 簡易リンク */}
          <div className="flex items-center gap-2">
            <nav className="hidden sm:flex items-center gap-3 text-sm text-slate-700">
              <Link href="/needs" className="hover:text-slate-900">ニーズ一覧</Link>
              <Link href="/me" className="hover:text-slate-900">マイページ</Link>
              <Link href="/login" className="hover:text-slate-900">ログイン</Link>
            </nav>
            <button
              className="sm:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border border-slate-300"
              aria-label="メニューを開く"
              onClick={() => setOpen(true)}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>
      </header>

      {/* モバイルドロワー */}
      {open && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 bg-white shadow-xl p-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="font-semibold">メニュー</div>
              <button aria-label="閉じる" onClick={() => setOpen(false)}>
                <svg viewBox="0 0 24 24" className="w-6 h-6"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="pt-3">
              <LeftDock mode="mobile" onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}