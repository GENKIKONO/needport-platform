"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  useEffect(()=>{ 
    if (!open) return;
    const onEsc = (e: KeyboardEvent)=>{ if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onEsc); 
    return ()=> document.removeEventListener("keydown", onEsc);
  }, [open]);

  return (
    <div className="md:hidden">
      <button aria-label="メニュー" className="p-2 rounded border" onClick={()=>setOpen(true)}>
        ☰
      </button>
      {open && (
        <div aria-modal="true" role="dialog" className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold">NeedPort</div>
              <button aria-label="閉じる" className="p-2" onClick={()=>setOpen(false)}>✕</button>
            </div>
            <Link href="/v2" onClick={()=>setOpen(false)} className="py-2 border-b">ホーム</Link>
            <Link href="/needs" onClick={()=>setOpen(false)} className="py-2 border-b">ニーズ</Link>
            <Link href="/vendors" onClick={()=>setOpen(false)} className="py-2 border-b">事業者</Link>
            <Link href="/needs/new" onClick={()=>setOpen(false)} className="py-2 border-b">投稿</Link>
            <Link href="/me" onClick={()=>setOpen(false)} className="py-2">マイページ</Link>
          </div>
        </div>
      )}
    </div>
  );
}
