"use client";
import ShipIcon from "@/components/icons/Ship";

export default function FlowStrip({ active = 0, steps = 5 }: { active?: number; steps?: number; }) {
  const pct = steps > 1 ? (active / (steps - 1)) * 100 : 0;
  return (
    <div id="flowstrip-main" className="relative rounded-2xl border border-black/5 bg-gradient-to-r from-sky-50 to-indigo-50 p-4 shadow-card">
      <div className="relative h-2 bg-sky-100 rounded-full">
        <div
          className="absolute -top-3 w-6 h-6 transition-[left] duration-500 ease-out"
          style={{ left: `calc(${pct}% - 12px)` }}
          aria-hidden
        >
          <ShipIcon className="w-6 h-6 text-sky-600 drop-shadow" />
        </div>
      </div>
    </div>
  );
}
