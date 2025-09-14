// src/components/chrome/Header.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import LeftDock from '../nav/LeftDock';
import { NavQuickLinks } from '../global/NavQuickLinks';

export default function Header() {
  const [open, setOpen] = useState(false);
  const { isSignedIn, user } = useUser();

  return (
    <>
      {/* シンプルで柔らかいトップバー */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-blue-100/50">
        <div className="w-full h-16 px-3 sm:px-4 lg:px-6 flex items-center justify-between">
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
          <div className="flex items-center gap-4">
            <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold">
              <Link href="/needs" className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors px-4 py-2.5 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-100">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                ニーズを探す
              </Link>
              <Link href="/needs/new" className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors px-4 py-2.5 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-100">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                ニーズを投稿
              </Link>
            </nav>
            <NavQuickLinks className="hidden sm:flex" />
            <div className="flex items-center gap-2 sm:gap-3">
              {isSignedIn ? (
                <Link href="/me" className="flex items-center gap-2 bg-blue-600 text-white px-3 sm:px-4 lg:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors">
                  {user?.imageUrl ? (
                    <img 
                      src={user.imageUrl} 
                      alt="プロフィール写真" 
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <span className="hidden sm:inline">マイページ</span>
                </Link>
              ) : (
                <>
                  <Link href="/sign-in" className="bg-blue-600 text-white px-3 sm:px-4 lg:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors">
                    一般ログイン
                  </Link>
                  <Link href="/vendors/login" className="bg-slate-600 text-white px-3 sm:px-4 lg:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-slate-700 transition-colors">
                    事業者ログイン
                  </Link>
                </>
              )}
            </div>
{/* スマホ用ハンバーガーメニューをヘッダーから削除 */}
          </div>
        </div>
      </header>

      {/* スマホ画面：右下固定ハンバーガーメニュー */}
      <button
        type="button"
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center border-4 border-white"
        aria-label="メニューを開く"
        onClick={() => setOpen(true)}
        style={{
          boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* モバイルドロワー（LeftDock を流用） */}
      {open && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-80 max-w-[85vw] bg-white shadow-xl p-4 transform transition-transform duration-300 ease-in-out">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="font-semibold">メニュー</div>
              {/* 元の×ボタンは削除 */}
            </div>

            <div className="pt-3">
              {/* LeftDock は ul/li/Link の集合想定。モバイルでもそのまま描画 */}
              <LeftDock onItemClick={() => setOpen(false)} />
            </div>
          </div>
          
          {/* メニュー展開時も同じ位置にハンバーガーボタンを配置 */}
          <button
            type="button"
            className="fixed bottom-6 right-6 z-60 w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center border-4 border-white"
            aria-label="メニューを閉じる"
            onClick={() => setOpen(false)}
            style={{
              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}
    </>
  );
}