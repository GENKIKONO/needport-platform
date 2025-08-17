"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function MobileDrawer({ open, onClose }:{open:boolean; onClose:()=>void}) {
  const [siteInfoOpen, setSiteInfoOpen] = useState(false);

  // 背景スクロールロック
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // ESCキーで閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      <div className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} aria-hidden />
      <aside 
        className={`absolute right-0 top-0 h-full w-[88%] max-w-sm bg-white shadow-xl transition-transform will-change-transform ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="p-5 border-b flex items-center justify-between">
          <div className="text-lg font-semibold">NeedPort</div>
          <button onClick={onClose} aria-label="close" className="rounded-full bg-sky-100 px-3 py-1">×</button>
        </div>
        <nav className="p-4 space-y-2">
          <Link href="/needs" className="flex items-center gap-3 rounded-xl p-3 hover:bg-sky-50">
            <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            みんなの「欲しい」
          </Link>
          <Link href="/services" className="flex items-center gap-3 rounded-xl p-3 hover:bg-sky-50">
            <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            企業の「できる」
          </Link>
          <Link href="/guide" className="flex items-center gap-3 rounded-xl p-3 hover:bg-sky-50">
            <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            サービス航海図
          </Link>
          
          <div className="mt-4 border-t pt-4">
            <details open={siteInfoOpen} onToggle={(e) => setSiteInfoOpen(e.currentTarget.open)}>
              <summary className="flex items-center gap-3 rounded-xl p-3 hover:bg-sky-50 cursor-pointer text-sm text-neutral-500">
                <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                サイト情報
                <svg className={`w-4 h-4 ml-auto transition-transform ${siteInfoOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-2 ml-8 space-y-1">
                <Link href="/privacy" className="block rounded-lg p-2 hover:bg-sky-50 text-sm">プライバシーポリシー</Link>
                <Link href="/terms" className="block rounded-lg p-2 hover:bg-sky-50 text-sm">利用規約</Link>
                <Link href="/company" className="block rounded-lg p-2 hover:bg-sky-50 text-sm">運営会社</Link>
                <Link href="/law" className="block rounded-lg p-2 hover:bg-sky-50 text-sm">特定商取引法</Link>
              </div>
            </details>
          </div>
        </nav>
      </aside>
    </div>
  );
}
