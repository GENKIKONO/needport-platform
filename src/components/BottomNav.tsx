'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, SquarePen, UserRound } from 'lucide-react';
import useMounted from './util/useMounted';

const items = [
  { href: '/', label: 'ホーム', icon: Home },
  { href: '/needs', label: 'ニーズ', icon: List },
  { href: '/post', label: '投稿', icon: SquarePen },
  { href: '/me', label: 'マイ', icon: UserRound },
];

export default function BottomNav() {
  // ✅ すべての hooks は常に同じ順序で呼ぶ
  const pathname = usePathname();
  const mounted = useMounted();
  
  // 初回は非活性表示にしておき、return null は避ける（hooks 数を揃える）
  const disabled = !mounted;
  return (
    <nav
      className="
        fixed z-40 left-0 right-0 bottom-0
        bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80
        border-t border-neutral-200
        pb-[env(safe-area-inset-bottom)]
      "
      role="navigation" aria-label="Primary"
      aria-disabled={disabled}
      style={disabled ? {pointerEvents:'none', opacity:.001}:undefined}
    >
      <div className="container">
        <ul className="grid grid-cols-4 h-14">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/' && pathname?.startsWith(href));
            return (
              <li key={href} className="flex">
                <Link
                  href={href}
                  aria-label={label}
                  aria-current={active ? 'page' : undefined}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 text-xs
                    ${active ? 'text-brand-600 font-medium' : 'text-neutral-500 hover:text-neutral-800'}`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-brand-600' : ''}`} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
