"use client";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type ToastMsg = { id: number; text: string; type?: "success"|"error"|"info" };
type Ctx = { toast: (text: string, type?: ToastMsg["type"]) => void };

const ToastCtx = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<ToastMsg[]>([]);
  const idRef = useRef(1);

  const toast = useCallback((text: string, type: ToastMsg["type"]="success") => {
    const id = idRef.current++;
    setList(prev => [...prev, { id, text, type }]);
    setTimeout(() => setList(prev => prev.filter(t => t.id !== id)), 2000);
  }, []);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="fixed right-4 top-4 z-[1000] space-y-2">
        {list.map(t => (
          <div
            key={t.id}
            className={`min-w-[220px] max-w-[360px] rounded-lg border px-3 py-2 text-sm shadow-md
              ${t.type==="success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
                 t.type==="error"   ? "bg-rose-50 border-rose-200 text-rose-800" :
                                      "bg-slate-50 border-slate-200 text-slate-800"}`}
            role="status"
            aria-live="polite"
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx.toast;
}
