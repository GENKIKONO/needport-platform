"use client";
import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";
import { NAV_LINKS } from "@/lib/nav";

export default function AppHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="NeedPortホーム">
          <Logo showText className="h-9" />
        </Link>

        {/* --- デスクトップ常時メニュー --- */}
        <nav className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/needs/new"
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 transition-colors"
          >
            ニーズを投稿
          </Link>
        </nav>

        {/* --- モバイル：ハンバーガー --- */}
        <button
          type="button"
          aria-label="メニューを開く"
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
          onClick={() => setOpen(true)}
        >
          {/* Hamburger SVG */}
          <svg width="24" height="24" aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 6h18M3 12h18M3 18h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* --- モバイル：ドロワー --- */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="ml-auto h-full w-80 bg-white shadow-xl p-4 flex flex-col">
            <div className="flex items-center justify-between h-10">
              <span className="text-base font-semibold">メニュー</span>
              <button
                aria-label="メニューを閉じる"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => setOpen(false)}
              >
                {/* Close SVG */}
                <svg width="24" height="24" aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M6 6l12 12M18 6l-12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <nav className="mt-4 grid gap-2">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-md px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/needs/new"
                className="mt-2 rounded-md bg-blue-600 px-3 py-2 text-white text-center hover:bg-blue-700 transition-colors"
                onClick={() => setOpen(false)}
              >
                ニーズを投稿
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
