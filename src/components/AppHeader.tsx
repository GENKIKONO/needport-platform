"use client";
import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import MobileDrawer from "./MobileDrawer";

export default function AppHeader(){
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white">
        <div className="container flex items-center justify-between gap-3 h-14 px-4">
          <Link href="/" className="flex items-center gap-2" aria-label="NeedPortホーム">
            <Logo showText className="h-9" />
          </Link>
          <button 
            onClick={()=>setOpen(true)} 
            className="p-3 min-h-[44px] min-w-[44px] -m-2 rounded-lg hover:bg-slate-100 active:bg-slate-200" 
            aria-label="メニューを開く"
          >
            <svg className="h-7 w-7 md:h-8 md:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>
      <MobileDrawer open={open} onClose={()=>setOpen(false)} />
    </>
  );
}
