"use client";
import Logo from "@/components/brand/Logo";
import { MENU } from "../nav/menuData";
import Link from "next/link";
import { useState } from "react";

export default function MobileHeader() {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur border-b">
      <div className="h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Logo className="w-6 h-6" /><span className="font-medium">NeedPort</span>
        </div>
        <button aria-label="メニュー" onClick={() => setOpen(v=>!v)} className="p-2">
          <div className="w-6 h-[2px] bg-slate-800 mb-[6px]" />
          <div className="w-6 h-[2px] bg-slate-800" />
        </button>
      </div>
      {open && (
        <div className="border-t bg-white">
          {MENU.map(g => (
            <div key={g.title} className="px-4 py-3">
              <div className="text-xs font-semibold text-slate-500">{g.title}</div>
              <ul className="mt-2">
                {g.items.map(i => (
                  <li key={i.href}>
                    <Link href={i.href} className="block py-2">{i.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
