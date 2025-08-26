"use client";
import Logo from "@/components/brand/Logo";
import { getMenuData } from "../nav/menuData";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function MobileHeader() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<any[]>([]);

  useEffect(() => {
    getMenuData().then(setMenu);
  }, []);
  return (
    <div className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur border-b">
      <div className="h-14 flex items-center justify-between px-4">
        {/* 左：ハンバーガー */}
        <button aria-label="メニュー" onClick={() => setOpen(v=>!v)} className="p-2">
          <div className="w-6 h-[2px] bg-slate-800 mb-[6px]" />
          <div className="w-6 h-[2px] bg-slate-800" />
        </button>
        
        {/* 中央：船ロゴ＋NeedPort */}
        <div className="flex items-center gap-2">
          <Logo className="w-6 h-6" />
          <span className="font-medium">NeedPort</span>
        </div>
        
        {/* 右：空（将来用） */}
        <div className="w-10" />
      </div>
      
      {/* ドロワー */}
      {open && (
        <div className="border-t bg-white">
          {menu.map(g => (
            <div key={g.title} className="px-4 py-3">
              <div className="text-xs font-semibold text-slate-500">{g.title}</div>
              <ul className="mt-2">
                {g.items.map(i => (
                  <li key={i.href}>
                    <Link href={i.href} className="block py-2" onClick={() => setOpen(false)}>{i.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          {/* ログインボタン */}
          <div className="px-4 py-3 border-t space-y-2">
            <Link href="/signup" className="block w-full bg-gradient-to-r from-[var(--np-blue-accent)] to-[var(--np-blue)] text-white text-center py-2 rounded-md" onClick={() => setOpen(false)}>
              一般ログイン
            </Link>
            <Link href="/vendor/register" className="block w-full bg-white text-[var(--np-blue-accent)] border border-[var(--np-blue-accent)] text-center py-2 rounded-md" onClick={() => setOpen(false)}>
              事業者ログイン
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
