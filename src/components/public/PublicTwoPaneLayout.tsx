'use client';

import { ReactNode } from 'react';
import PublicSidebarNav from './PublicSidebarNav';

interface PublicTwoPaneLayoutProps {
  children: ReactNode;
}

export default function PublicTwoPaneLayout({ children }: PublicTwoPaneLayoutProps) {
  return (
    <div className="grid grid-cols-[280px,1fr] h-[100dvh] lg:grid-cols-[280px,1fr]">
      {/* 左サイドバー */}
      <aside className="overflow-y-auto overscroll-contain border-r border-gray-200 bg-white">
        <PublicSidebarNav />
      </aside>
      
      {/* 右メインコンテンツ */}
      <main className="overflow-y-auto overscroll-contain pb-[max(6rem,12vh)]">
        {children}
      </main>
    </div>
  );
}
