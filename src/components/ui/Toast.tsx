"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type ToastMsg = { id: number; text: string };
const ToastCtx = createContext<(text: string) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const idRef = useRef(1);
  const notify = (text: string) => {
    const id = idRef.current++;
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2000);
  };
  return (
    <ToastCtx.Provider value={notify}>
      {children}
      {createPortal(
        <div className="fixed right-4 top-4 z-[1000] space-y-2">
          {toasts.map((t) => (
            <div key={t.id} className="rounded-lg bg-neutral-900 text-white px-3 py-2 shadow">
              {t.text}
            </div>
          ))}
        </div>,
        typeof window !== "undefined" ? document.body : ({} as any)
      )}
    </ToastCtx.Provider>
  );
}
export function useToast() { return useContext(ToastCtx); }
