"use client";
import { useEffect } from "react";
export function Modal({open,onClose,children,title}:{open:boolean; onClose:()=>void; children:React.ReactNode; title?:string}) {
  useEffect(()=>{
    document.body.style.overflow = open ? "hidden" : "";
    return ()=>{ document.body.style.overflow = ""; };
  },[open]);
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative max-w-lg mx-auto mt-20 bg-white rounded-lg border shadow-lg" onClick={(e)=>e.stopPropagation()}>
        {title && <div className="px-4 py-3 border-b font-medium">{title}</div>}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
