// src/components/nav/LeftDock.tsx
import Link from 'next/link';

type Item = { href: string; label: string };
const groups: { title: string; items: Item[] }[] = [
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
    items: [
      { href: '/me', label: 'マイページ' },
      { href: '/login', label: 'ログイン' },
      { href: '/vendors/login', label: '事業者ログイン' },
    ],
  },
];

export default function LeftDock() {
  return (
    <nav className="text-sm space-y-5 p-3">
      {groups.map((g) => (
        <section key={g.title}>
          <div className="px-2 pb-1 text-xs text-slate-500">{g.title}</div>
          <ul className="space-y-1">
            {g.items.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className="block px-2 py-1 rounded hover:bg-slate-50 text-slate-700"
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