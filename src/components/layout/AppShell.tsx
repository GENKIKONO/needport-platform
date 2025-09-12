// src/components/layout/AppShell.tsx
'use client';

import React from 'react';
import Header from '@/components/chrome/Header';
import LeftDock from '@/components/nav/LeftDock';
import Footer from './Footer';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/20 via-slate-50 to-blue-50/30 text-slate-900" style={{backgroundColor: '#fafafa'}}>
      {/* 薄いトップヘッダー（常時表示） */}
      <Header />

      {/* コンテンツ幅は中央 7xl、PCは左にサイドナビ */}
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <div className="flex gap-6 pt-4">
          {/* PCだけ表示 */}
          <aside className="hidden lg:block w-64 shrink-0 border border-blue-100/50 bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm">
            <LeftDock />
          </aside>

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}