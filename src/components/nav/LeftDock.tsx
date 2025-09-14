// src/components/nav/LeftDock.tsx
import Link from 'next/link';

type Item = { href: string; label: string };
const groups: { title: string; items: Item[] }[] = [
  {
    title: "基本機能",
    items: [
      { href: '/needs', label: 'ニーズを探す' },
      { href: '/needs/new', label: 'ニーズを投稿する' },
    ],
  },
  {
    title: 'アカウント',
    items: [
      { href: '/me', label: 'マイページ' },
    ],
  },
];

interface LeftDockProps {
  onItemClick?: () => void;
}

export default function LeftDock({ onItemClick }: LeftDockProps) {
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