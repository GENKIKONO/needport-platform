"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function HeaderV2(){
  const [open, setOpen] = useState(false);
  useEffect(()=>{
    document.body.style.overflow = open ? "hidden" : "";
    return ()=>{ document.body.style.overflow=""; }
  },[open]);
  return (
    <header className="sticky top-0 z-40 bg-white border-b">
      <div className="max-w-6xl mx-auto h-14 px-3 flex items-center justify-between">
        <Link href="/v2" className="font-semibold tracking-tight">NeedPort</Link>
        <nav className="hidden md:flex items-center gap-4 text-sm">
          <Link href="/needs" className="hover:underline">ニーズ</Link>
          <Link href="/vendors" className="hover:underline">事業者リスト</Link>
          <Link href="/me" className="hover:underline">マイページ</Link>
        </nav>
        <button className="md:hidden p-2" aria-label="メニュー" onClick={()=>setOpen(true)}>
          <span className="block w-5 h-0.5 bg-slate-800 mb-1"></span>
          <span className="block w-5 h-0.5 bg-slate-800 mb-1"></span>
          <span className="block w-5 h-0.5 bg-slate-800"></span>
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 bg-black/40" onClick={()=>setOpen(false)}>
          <div className="absolute top-0 right-0 w-72 h-full bg-white p-4"
               onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold">メニュー</div>
              <button aria-label="閉じる" onClick={()=>setOpen(false)}>✕</button>
            </div>
            <div className="grid gap-3 text-sm">
              <Link href="/v2" onClick={()=>setOpen(false)}>ホーム</Link>
              <Link href="/needs" onClick={()=>setOpen(false)}>ニーズ</Link>
              <Link href="/vendors" onClick={()=>setOpen(false)}>事業者リスト</Link>
              <Link href="/me" onClick={()=>setOpen(false)}>マイページ</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
