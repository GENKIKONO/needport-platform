// src/components/layout/Header.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header({ onToggleMenu }: { onToggleMenu: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Hamburger (SP) */}
          <button
            className="lg:hidden p-2 rounded hover:bg-slate-100"
            aria-label="メニュー"
            onClick={onToggleMenu}
          >
            {/* icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 font-semibold">
            {/* 船アイコン風（SVG） */}
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden className="text-sky-600">
              <path d="M3 15l9-9 9 9-9 3z" fill="currentColor" />
            </svg>
            <span>NeedPort</span>
          </Link>
        </div>

        {/* 右端ナビ（PC） */}
        <nav className="hidden lg:flex items-center gap-6 text-sm">
          <Link className="hover:text-sky-700" href="/needs">ニーズ一覧</Link>
          <Link className="hover:text-sky-700" href="/me">マイページ</Link>
          <Link className="hover:text-sky-700" href="/login">ログイン</Link>
        </nav>
      </div>
    </header>
  );
}
