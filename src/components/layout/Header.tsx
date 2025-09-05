'use client';

import Link from 'next/link';
import { useRef } from 'react';
import LeftDock from '@/components/nav/LeftDock';

export default function Header() {
  const dlg = useRef<HTMLDialogElement>(null);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4">
        {/* モバイル：ハンバーガー */}
        <button
          aria-label="メニュー"
          onClick={() => dlg.current?.showModal()}
          className="rounded p-2 hover:bg-slate-100 lg:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>

        {/* ロゴ */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-sky-600" aria-hidden>
            <path d="M4 18h16l-2-9H6l-2 9zM7 18v2m10-2v2M9 7a3 3 0 016 0" fill="none" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span>NeedPort</span>
        </Link>

        {/* PC：右上ショートリンク */}
        <nav className="hidden items-center gap-4 text-sm lg:flex">
          <Link href="/needs" className="text-sky-700 hover:underline">ニーズ一覧</Link>
          <Link href="/needs/new" className="text-sky-700 hover:underline">ニーズを投稿</Link>
          <Link href="/me" className="text-sky-700 hover:underline">マイページ</Link>
          <Link href="/sign-in" className="rounded border px-2 py-1 hover:bg-slate-50">ログイン</Link>
        </nav>
      </div>

      {/* モバイルドロワー（dialog） */}
      <dialog
        ref={dlg}
        className="m-0 h-screen w-screen max-w-none bg-white p-0 open:flex open:flex-col"
        onClick={(e) => {
          // 背景クリックで閉じる
          if (e.target === dlg.current) dlg.current?.close();
        }}
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
          <span className="font-semibold">メニュー</span>
          <button onClick={() => dlg.current?.close()} aria-label="閉じる" className="rounded p-2 hover:bg-slate-100">
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <LeftDock />
        </div>
      </dialog>
    </header>
  );
}
