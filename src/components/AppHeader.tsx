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
          <Link href="/" className="flex items-center gap-2">
            <Logo showText className="h-9" />
          </Link>
          <button 
            onClick={()=>setOpen(true)} 
            className="p-3 min-h-[44px] min-w-[44px] -m-2 rounded-lg hover:bg-slate-100 active:bg-slate-200" 
            aria-label="メニューを開く"
          >
            <span className="h-7 w-7 md:h-8 md:w-8">☰</span>
          </button>
        </div>
      </header>
      <MobileDrawer open={open} onClose={()=>setOpen(false)} />
    </>
  );
}
