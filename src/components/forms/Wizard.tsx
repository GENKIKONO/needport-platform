'use client';
import { ReactNode, useMemo } from 'react';

export function Wizard({ step, total }: { step: number; total: number }) {
  const pct = useMemo(() => Math.round((step / total) * 100), [step, total]);
  
  return (
    <div className="mb-6">
      <div className="text-sm text-[var(--c-text-muted)]">Step {step} / {total}</div>
      <div className="mt-2 h-2 w-full rounded bg-[var(--c-border)]">
        <div 
          className="h-2 rounded bg-[var(--c-blue)] transition-all duration-300" 
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
