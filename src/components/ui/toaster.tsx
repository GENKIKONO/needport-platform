"use client";
import React from "react";
import { useToast } from "./use-toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="fixed z-[9999] bottom-4 right-4 space-y-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className="max-w-xs rounded-md border border-slate-200 bg-white shadow-md p-3"
          role="status"
        >
          {t.title && <div className="font-medium">{t.title}</div>}
          {t.description && <div className="text-sm text-slate-600">{t.description}</div>}
          <button
            onClick={() => dismiss(t.id)}
            className="mt-2 text-xs text-slate-500 hover:underline"
            aria-label="閉じる"
          >
            閉じる
          </button>
        </div>
      ))}
    </div>
  );
}
