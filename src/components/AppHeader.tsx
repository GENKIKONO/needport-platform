"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import Logo from './Logo';
import MobileMenu from './MobileMenu';

export default function AppHeader(){
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white">
        <div className="container flex items-center justify-between gap-3 h-[60px] px-4">
                  {/* ロゴは1つに統一（Logo側がテキストを含むなら span は削除） */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Logo className="w-7 h-7" />
          {/* 重複防止: 片方だけにする。Logoがアイコンのみなら下のspanを残す */}
          {/* <span className="font-semibold text-neutral-900 hidden sm:inline">NeedPort</span> */}
        </Link>
          <button
            onClick={() => setMenuOpen(true)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-neutral-700 hover:bg-neutral-100 outline-none"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
