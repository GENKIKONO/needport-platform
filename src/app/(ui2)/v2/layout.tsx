"use client";
import "../../globals.css";
import type { ReactNode } from "react";
import { useState } from "react";
import SideNav from "@/app/(ui2)/_layout/SideNav";
function MobileDrawer({open, onClose}:{open:boolean; onClose:()=>void}){
  if(!open) return null;
  return (
    <div className="lg:hidden fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-[86%] max-w-[320px] bg-white border-r border-slate-200 shadow-xl overflow-y-auto">
        <div className="p-3 border-b flex items-center justify-between">
          <div className="font-semibold">メニュー</div>
          <button onClick={onClose} className="px-2 py-1 rounded hover:bg-slate-100">閉じる</button>
        </div>
        <SideNav />
      </div>
    </div>
  );
}

export default function V2Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-[calc(100vh-56px)] lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* Sidebar (PC常時表示。縦スクロール可 / 横不可) */}
      <aside className="hidden lg:block border-r border-slate-200">
        <div className="sticky top-14 h-[calc(100vh-56px)] overflow-y-auto overflow-x-hidden">
          <SideNav />
        </div>
      </aside>
      {/* Main */}
      <div className="min-w-0 overflow-x-hidden relative">
        {/* Mobile hamburger button (header下、v2配下のみ) */}
        <button
          onClick={()=>setOpen(true)}
          className="lg:hidden absolute -left-1 top-2 z-10 translate-x-2 px-3 py-1.5 rounded border bg-white shadow-sm text-sm"
          aria-label="メニューを開く"
        >
          メニュー
        </button>
        {children}
      </div>
      <MobileDrawer open={open} onClose={()=>setOpen(false)} />
    </div>
  );
}
