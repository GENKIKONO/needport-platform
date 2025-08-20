"use client";
import { useState } from "react";
import { navGroups } from "@/components/nav/menuData";

export default function MobileHeader() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur border-b h-14">
        <div className="mx-auto flex h-14 items-center justify-between px-4">
          <a href="/" className="flex items-center gap-2">
            <ShipIcon className="h-5 w-5 text-sky-600" aria-hidden />
            <span className="font-semibold">NeedPort</span>
          </a>
          <button
            aria-label="メニュー"
            onClick={() => setOpen(true)}
            className="p-2 rounded hover:bg-gray-100"
          >
            <Burger className="h-6 w-6" aria-hidden />
          </button>
        </div>
      </header>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[80%] max-w-[320px] bg-white shadow-xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShipIcon className="h-5 w-5 text-sky-600" aria-hidden />
                <span className="font-semibold">NeedPort</span>
              </div>
              <button className="p-2" onClick={() => setOpen(false)} aria-label="閉じる">
                <Close className="h-6 w-6" aria-hidden />
              </button>
            </div>
            <nav className="space-y-6">
              {navGroups.map((g) => (
                <div key={g.title}>
                  <div className="text-xs text-gray-500 mb-2">{g.title}</div>
                  <ul className="space-y-1">
                    {g.items.map((it) => (
                      <li key={it.href}>
                        <a className="block rounded px-3 py-2 hover:bg-gray-50" href={it.href} onClick={() => setOpen(false)}>
                          {it.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}

function ShipIcon(p:any){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path d="M3 15l9-5 9 5-9 5-9-5Z"/><path d="M12 4v6"/></svg>)}
function Burger(p:any){return(<svg viewBox="0 0 24 24" stroke="currentColor" fill="none" {...p}><path d="M3 6h18M3 12h18M3 18h18"/></svg>)}
function Close(p:any){return(<svg viewBox="0 0 24 24" stroke="currentColor" fill="none" {...p}><path d="M6 6l12 12M18 6l-12 12"/></svg>)}
