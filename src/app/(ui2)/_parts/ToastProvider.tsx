"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type Toast = { id: number; message: string; kind?: "info"|"error"|"success" };
const Ctx = createContext<{push:(t:Omit<Toast,"id">)=>void}>({push:()=>{}});
export function useToast(){ return useContext(Ctx); }

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<Toast[]>([]);
  const push = (t: Omit<Toast,"id">)=> {
    const id = Date.now();
    setList(s=>[...s,{ id, ...t }]);
    setTimeout(()=> setList(s=> s.filter(x=>x.id!==id)), 3500);
  };
  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 space-y-2">
        {list.map(t=>(
          <div key={t.id} className={`px-3 py-2 rounded shadow text-white text-sm
            ${t.kind==="error" ? "bg-red-600" : t.kind==="success" ? "bg-emerald-600" : "bg-slate-700"}`}>
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
