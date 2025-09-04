"use client";
import SideNav from "@/app/(ui2)/_layout/SideNav";

export default function MobileDrawer({open, onClose}:{open:boolean; onClose:()=>void}){
  if(!open) return null;
  // 背景スクロール抑止
  if (typeof document !== "undefined") { document.body.style.overflow='hidden'; setTimeout(()=>{ document.body.style.overflow=''; }, 0); }
  return (
    <div className="lg:hidden fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-[86%] max-w-[320px] bg-white border-r border-slate-200 shadow-xl overflow-y-auto z-50">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">メニュー</h2>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">✕</button>
          </div>
          <SideNav />
        </div>
      </div>
    </div>
  );
}
