'use client';
import React from 'react';
import Header from '@/components/chrome/Header';
import LeftDock from '@/components/nav/LeftDock';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ヘッダー */}
      <Header />

      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
        <div className="flex gap-6 pt-4">
          {/* 左ドック（PCで表示） */}
          <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200 bg-white rounded-md">
            <LeftDock />
          </aside>

          {/* メイン */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}