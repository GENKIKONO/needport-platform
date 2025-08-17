'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  
  const tabs = [
    { href: '/needs', label: 'みんなの「欲しい」' },
    { href: '/providers', label: '企業の「できる」' },
    { href: '/guide', label: 'サービス航海図' },
    { href: '/about', label: 'サイト情報' },
  ];

  return (
    <header className="border-b border-white/10 sticky top-0 z-40 backdrop-blur bg-black/40">
      <div className="container flex items-center justify-between py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-white">
          <span className="inline-block h-3 w-3 rounded-sm bg-brand-600" />
          <span className="text-lg">NeedPort</span>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === tab.href
                  ? 'bg-brand-600 text-white'
                  : 'text-neutral-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {/* Login Placeholder */}
        <div className="hidden md:block">
          <button className="btn btn-ghost text-sm opacity-60">
            ログイン(近日)
          </button>
        </div>
      </div>
    </header>
  );
}
