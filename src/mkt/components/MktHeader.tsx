'use client';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function MktHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/95 backdrop-blur">
      <div className="container flex items-center justify-between gap-3 h-[60px] px-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo showText />
        </Link>
        <Link 
          href="/post" 
          className="btn btn-primary h-9 px-4 text-sm"
        >
          無料ではじめる
        </Link>
      </div>
    </header>
  );
}
