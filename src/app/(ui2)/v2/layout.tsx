"use client";
import "../../globals.css";
import type { ReactNode } from "react";
import SideNav from "@/app/(ui2)/_layout/SideNav";

export default function V2Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-56px)] lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* Sidebar (PC常時表示。縦スクロール可 / 横不可) */}
      <aside className="hidden lg:block border-r border-slate-200">
        <div className="sticky top-14 h-[calc(100vh-56px)] overflow-y-auto overflow-x-hidden">
          <SideNav />
        </div>
      </aside>
      {/* Main */}
      <div className="min-w-0 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
