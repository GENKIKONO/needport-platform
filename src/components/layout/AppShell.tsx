'use client';

import React from 'react';
import Header from './Header';
import LeftDock from '@/components/nav/LeftDock';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* スキップリンク */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 rounded bg-sky-600 px-3 py-2 text-white"
      >
        本文へスキップ
      </a>

      <Header />

      <div className="mx-auto flex w-full max-w-7xl">
        {/* PC：左サイドナビ（lg以上で表示） */}
        <aside className="hidden shrink-0 border-r border-slate-200 lg:block lg:w-64">
          <LeftDock />
        </aside>

        {/* メイン領域 */}
        <main id="main" className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
