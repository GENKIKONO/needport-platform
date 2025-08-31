'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Header(){
  const [open, setOpen] = useState(false);
  // 背景のスクロール固定（モバイルメニュー開時）
  useEffect(()=>{
    if (open) { document.body.style.overflow='hidden'; }
    else { document.body.style.overflow=''; }
    return ()=>{ document.body.style.overflow=''; };
  },[open]);
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
      <div className="mx-auto max-w-7xl flex items-center justify-between h-14 px-4">
        {/* 左上ロゴ：常にホームへ */}
        <Link href="/" aria-label="NeedPort ホームへ">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="NeedPort" className="h-6 w-auto" />
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          <a href="/vendor/connect" className="text-sm hover:underline">事業者口座登録</a>
          <a href="/needs" className="text-sm hover:underline">ニーズ一覧</a>
          <a href="/guide" className="text-sm hover:underline">ガイド</a>
        </nav>
        <button
          className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded hover:bg-gray-100"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={()=>setOpen(v=>!v)}
        >
          <span className="sr-only">メニュー</span>
          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor"/></svg>
        </button>
      </div>
      {/* モバイルメニュー（開閉時に背景固定） */}
      <div
        id="mobile-menu"
        className={`md:hidden fixed inset-x-0 top-14 bg-white border-t transition-[max-height,opacity] duration-200 overflow-hidden ${open ? 'max-h-[50vh] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <nav className="px-4 py-3 flex flex-col">
          <a href="/vendor/connect" onClick={()=>setOpen(false)} className="py-2">事業者口座登録</a>
          <Link href="/needs" onClick={()=>setOpen(false)} className="py-2">ニーズ一覧</Link>
          <Link href="/guide" onClick={()=>setOpen(false)} className="py-2">ガイド</Link>
          <Link href="/me" onClick={()=>setOpen(false)} className="py-2">マイページ</Link>
        </nav>
      </div>
    </header>
  );
}
