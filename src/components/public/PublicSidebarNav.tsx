'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '../Logo';

const navItems = [
  { href: '/', label: 'ホーム', icon: '🏠' },
  { href: '/needs', label: 'ニーズ一覧', icon: '📋' },
  { href: '/needs/new', label: 'ニーズを投稿', icon: '✚' },
  { href: '/vendor/register', label: '事業者登録', icon: '🏢' },
  { href: '/me', label: 'マイページ', icon: '👤' },
];

const quickLinks = [
  { href: '/needs#region-filter', label: '高知の市町村から探す', icon: '🗺️' },
  { href: '/guide', label: 'はじめての方へ', icon: '❓' },
];

const footerLinks = [
  { href: '/terms', label: '利用規約' },
  { href: '/privacy', label: 'プライバシーポリシー' },
  { href: '/contact', label: 'お問い合わせ' },
];

export default function PublicSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full" aria-label="グローバル">
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
                <span className="text-lg" aria-hidden="true">{item.icon}</span>
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
                <span className="text-base" aria-hidden="true">{item.icon}</span>
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
