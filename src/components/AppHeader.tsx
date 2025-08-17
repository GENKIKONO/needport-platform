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
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
        <div className="container flex items-center py-3">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="font-semibold text-neutral-900">NeedPort</span>
          </Link>
          <div className="ml-auto">
            <button
              onClick={() => setMenuOpen(true)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-neutral-700 hover:bg-neutral-100"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
