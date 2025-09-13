// src/components/nav/LeftDock.tsx
"use client";
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';


interface LeftDockProps {
  onItemClick?: () => void;
}

export default function LeftDock({ onItemClick }: LeftDockProps) {
  const { isSignedIn } = useUser();

  // Authentication-aware groups
  const groups: { title: string; items: { href: string; label: string }[] }[] = [
    {
      title: "みんなの『欲しい』",
      items: [
        { href: '/needs', label: 'ニーズ一覧' },
        { href: '/needs/new', label: 'ニーズを投稿' },
      ],
    },
    {
      title: "企業の『できる』",
      items: [
        { href: '/vendors/register', label: '事業者登録' },
        { href: '/me/vendor/guide', label: '提案ガイド' },
        { href: '/sea', label: '海中（保管庫）' },
      ],
    },
    {
      title: 'ガイド',
      items: [
        { href: '/roadmap', label: 'サービス航海図' },
        { href: '/news', label: 'お知らせ' },
      ],
    },
    {
      title: 'アカウント',
      items: isSignedIn
        ? [{ href: '/me', label: 'マイページ' }]
        : [
            { href: '/sign-in', label: '一般ログイン' },
            { href: '/vendors/login', label: '事業者ログイン' },
          ],
    },
  ];
  return (
    <nav className="text-sm space-y-6 p-6">
      {groups.map((g) => (
        <section key={g.title}>
          <div className="px-3 pb-2 text-xs font-medium text-blue-600/80 uppercase tracking-wide">{g.title}</div>
          <ul className="space-y-1">
            {g.items.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className="block px-3 py-2 rounded-xl hover:bg-blue-50/50 text-slate-700 hover:text-blue-600/80 transition-all duration-200 font-medium"
                  onClick={onItemClick}
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
}