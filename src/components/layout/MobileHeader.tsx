'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '../brand/Logo';

// 左ドックと同じメニュー配列（共通化）
const navGroups = [
  {
    title: "みんなの『欲しい』",
    items: [
      { href: '/needs', label: 'ニーズ一覧', icon: 'list' },
      { href: '/needs/new', label: 'ニーズを投稿', icon: 'plus' },
    ]
  },
  {
    title: "企業の『できる』",
    items: [
      { href: '/vendor/register', label: '事業者登録', icon: 'building' },
      { href: '/vendor/services', label: 'サービス一覧', icon: 'services' },
    ]
  },
  {
    title: "ガイド",
    items: [
      { href: '/guide', label: '使い方', icon: 'guide' },
      { href: '/guide/offer', label: '提案の流れ', icon: 'flow' },
      { href: '/support', label: 'サポート', icon: 'support' },
    ]
  },
  {
    title: "サイト情報",
    items: [
      { href: '/info', label: 'NeedPortについて', icon: 'info' },
      { href: '/terms', label: '利用規約', icon: 'terms' },
      { href: '/privacy', label: 'プライバシーポリシー', icon: 'privacy' },
    ]
  }
];

const getIcon = (iconName: string) => {
  const icons = {
    list: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    plus: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    building: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    services: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    guide: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    flow: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    support: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    terms: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    privacy: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  };
  return icons[iconName as keyof typeof icons] || icons.info;
};

export default function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* ヘッダー */}
      <header className="lg:hidden sticky top-0 z-40 h-[56px] bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="flex items-center justify-between h-full px-4">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2" aria-label="NeedPortホーム">
            <Logo />
          </Link>
          
          {/* ハンバーガーボタン */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            aria-label="メニューを開く"
            aria-expanded={isOpen}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* ドロワー */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* オーバーレイ */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* ドロワー */}
          <div className="absolute right-0 top-0 h-full w-80 max-w-[80vw] bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* ヘッダー */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <Logo />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  aria-label="メニューを閉じる"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* メニュー */}
              <div className="flex-1 p-4 overflow-y-auto">
                {navGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="mb-6">
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {group.title}
                    </h3>
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                          <span className="text-gray-500" aria-hidden="true">{getIcon(item.icon)}</span>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* フッター */}
              <div className="p-4 border-t border-gray-200">
                <div className="text-xs text-gray-400 text-center">
                  © 2024 NeedPort
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
