"use client";
import { useState } from "react";
import Link from "next/link";
import MobileDrawer from "./MobileDrawer";

export default function AppHeader(){
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white">
        <div className="container flex items-center justify-between gap-3 h-[60px] px-4">
          <Link href="/" className="font-bold text-xl">NeedPort</Link>
          <button onClick={()=>setOpen(true)} className="p-2 rounded-lg hover:bg-neutral-100" aria-label="メニューを開く">☰</button>
        </div>
      </header>
      <MobileDrawer open={open} onClose={()=>setOpen(false)} />
    </>
  );
}
