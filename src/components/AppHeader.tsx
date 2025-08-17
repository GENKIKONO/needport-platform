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
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 dark:bg-neutral-900/60 border-b border-black/5">
        <div className="container flex items-center justify-between h-14">
          <Logo className="text-xl" />
          <nav className="hidden md:flex items-center gap-2">
            <Link className="btn btn-ghost" href="/needs">みんなの「欲しい」</Link>
            <Link className="btn btn-ghost" href="/services">企業の「できる」</Link>
            <Link className="btn btn-ghost" href="/guide">サービス航海図</Link>
          </nav>
          <button
            onClick={() => setMenuOpen(true)}
            className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-neutral-100"
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
