"use client";
import { ReactNode } from "react";

export function InfoRow({ icon, label, value }: { icon?: ReactNode; label: string; value?: ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <div className="mt-0.5">{icon ?? "•"}</div>
      <div>
        <div className="text-slate-500">{label}</div>
        <div className="text-slate-900">{value ?? <span className="text-slate-400">—</span>}</div>
      </div>
    </div>
  );
}

export function BlockCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border bg-white p-4">
      <h3 className="font-medium text-slate-900 mb-2">{title}</h3>
      <div className="grid sm:grid-cols-2 gap-3">{children}</div>
    </section>
  );
}
