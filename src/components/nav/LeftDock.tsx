"use client";
import Link from "next/link";
import { MENU } from "./menuData";
import Logo from "@/components/brand/Logo";

export default function LeftDock() {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-[300px] lg:h-dvh lg:sticky lg:top-0 lg:overflow-y-auto border-r bg-white">
      <div className="flex items-center gap-2 p-4">
        <Logo className="w-7 h-7" />
        <span className="font-semibold">NeedPort</span>
      </div>
      <nav className="px-2 pb-6 space-y-6">
        {MENU.map(g => (
          <div key={g.title}>
            <div className="px-2 text-xs font-semibold text-slate-500">{g.title}</div>
            <ul className="mt-2 space-y-1">
              {g.items.map(i => (
                <li key={i.href}>
                  <Link className="block rounded-md px-3 py-2 hover:bg-slate-50" href={i.href}>{i.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
