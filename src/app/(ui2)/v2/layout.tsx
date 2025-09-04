"use client";
import "../../globals.css";
import type { ReactNode } from "react";
import { useState } from "react";
import dynamic from "next/dynamic";
import SideNav from "@/app/(ui2)/_layout/SideNav";

const MobileDrawer = dynamic(() => import("./_parts/MobileDrawer"), { ssr: false });

export default function V2Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-[calc(100vh-56px)] lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* Sidebar */}
      <aside className="hidden lg:block border-r border-slate-200">
        <div className="sticky top-14 h-[calc(100vh-56px)] overflow-y-auto overflow-x-hidden z-30">
          <SideNav />
        </div>
      </aside>
      {/* Main */}
      <div className="min-w-0 overflow-x-hidden relative pt-2">
        {/* Mobile hamburger */}
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
