'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '../Logo';

const navItems = [
  { href: '/', label: 'ホーム', icon: 'home' },
  { href: '/needs', label: 'ニーズ一覧', icon: 'list' },
  { href: '/needs/new', label: 'ニーズを投稿', icon: 'plus' },
  { href: '/vendor/register', label: '事業者登録', icon: 'building' },
  { href: '/me', label: 'マイページ', icon: 'user' },
];

const quickLinks = [
  { href: '/needs#region-filter', label: '高知の市町村から探す', icon: 'map' },
  { href: '/guide', label: 'はじめての方へ', icon: 'help' },
];

const footerLinks = [
  { href: '/terms', label: '利用規約' },
  { href: '/privacy', label: 'プライバシーポリシー' },
  { href: '/support', label: 'お問い合わせ' },
];

const getIcon = (iconName: string) => {
  const icons = {
    home: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
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
    user: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    map: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    help: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };
  return icons[iconName as keyof typeof icons] || icons.help;
};

export default function LeftDock() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full" aria-label="サイトナビ">
      {/* ロゴ */}
      <div className="p-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2" aria-label="NeedPortホーム">
          <Logo showText className="h-8" />
        </Link>
      </div>

      {/* メインナビゲーション */}
      <div className="flex-1 p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-gray-500" aria-hidden="true">{getIcon(item.icon)}</span>
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* クイックリンク */}
        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            クイックアクセス
          </h3>
          <div className="space-y-1">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <span className="text-gray-400" aria-hidden="true">{getIcon(item.icon)}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* フッターリンク */}
      <div className="p-4 border-t border-gray-100">
        <div className="space-y-1">
          {footerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="mt-4 px-3 text-xs text-gray-400">
          © 2024 NeedPort
        </div>
      </div>
    </nav>
  );
}
