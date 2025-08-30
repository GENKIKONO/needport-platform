"use client";
import { useEffect } from "react";
import LeftDock from "@/components/nav/LeftDock";
import MobileHeader from "@/components/chrome/MobileHeader";
import BottomNav from "@/components/BottomNav";
import MktFooter from "@/mkt/components/MktFooter";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--c-bg)] text-[var(--c-text)]">
      <MobileHeader />
      <div className="flex-1 lg:grid lg:grid-cols-[300px,1fr] lg:gap-0">
        <aside className="hidden lg:block border-r border-[var(--c-border)] bg-white/60 backdrop-blur-sm">
          <div className="sticky top-0 h-[100dvh] overflow-y-auto">
            <LeftDock />
          </div>
        </aside>
        <main className="min-h-dvh pt-[var(--header-mobile)] lg:pt-0 pb-[var(--safe-bottom)]">
          {children}
        </main>
      </div>
      <BottomNav />
      <MktFooter />
    </div>
  );
}
