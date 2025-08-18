export function SupportMeter({ current, goal = 10 }: { current: number; goal?: number }) {
  const pct = Math.min(100, Math.round((current / Math.max(1, goal)) * 100))
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
        <span>賛同 {current}人</span>
        <span>{goal}人で出港</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
