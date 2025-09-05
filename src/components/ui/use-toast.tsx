"use client";
import React, {createContext, useContext, useState, useCallback} from "react";

export type Toast = { id: string; title?: string; description?: string; duration?: number };
type Ctx = {
  toasts: Toast[];
  toast: (t: Omit<Toast,"id">) => void;
  dismiss: (id: string) => void;
};
const ToastCtx = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = useCallback((id: string) => {
    setToasts((xs) => xs.filter((x) => x.id !== id));
  }, []);
  const toast = useCallback((t: Omit<Toast,"id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((xs) => [...xs, { id, duration: 3000, ...t }]);
    const dur = t.duration ?? 3000;
    if (dur > 0) setTimeout(() => dismiss(id), dur);
  }, [dismiss]);

  return <ToastCtx.Provider value={{toasts, toast, dismiss}}>{children}</ToastCtx.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
