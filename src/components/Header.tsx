'use client';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-white/10 sticky top-0 z-40 backdrop-blur bg-black/40">
      <div className="container flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-white">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-brand-600" />
          <span>NeedPort</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/search" className="btn btn-ghost">検索</Link>
          <Link href="/signup" className="btn btn-primary">登録する</Link>
        </nav>
      </div>
    </header>
  );
}
