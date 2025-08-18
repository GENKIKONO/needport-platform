"use client";
import {useMemo, useState} from "react";

type Props = {
  /** 親制御（省略時は内部stateで制御） */
  active?: number;
  /** ステップ（省略時はデフォルト） */
  steps?: string[];
  /** ラベルを表示するか（既定: 非表示） */
  showLabels?: boolean;
  /** クリック/ホバーでステップ変更を親に通知（省略可） */
  onStepChange?: (i: number) => void;
};

const DEFAULT_STEPS = ["投稿","賛同","提案","承認","ルーム","支払い"];

export default function FlowStrip({
  active,
  steps = DEFAULT_STEPS,
  showLabels = false,
  onStepChange,
}: Props) {
  // 後方互換: active未指定なら内部stateで制御
  const [internal, setInternal] = useState(0);
  const a = typeof active === "number" ? active : internal;

  // 安全: stepsが空でも割れない
  const denom = Math.max((steps?.length ?? DEFAULT_STEPS.length) - 1, 1);
  const left = useMemo(() => `calc(${(a * 100) / denom}% - 12px)`, [a, denom]);

  const set = (i: number) => {
    if (onStepChange) onStepChange(i);
    else setInternal(i);
  };

  return (
    <div className="relative rounded-2xl border border-black/5 bg-gradient-to-r from-sky-50 to-indigo-50 p-3 sm:p-4 shadow-card">
      <div className="relative h-1.5 sm:h-2 bg-sky-100 rounded-full">
        {/* 船アイコン（家は禁止） */}
        <div className="absolute -top-2.5 sm:-top-3 w-6 h-6 transition-[left] duration-500 ease-out" style={{ left }}>
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-sky-600 drop-shadow" aria-hidden>
            <path fill="currentColor" d="M3 11h3l2-4h8l2 4h3l-9 8-9-8z"/>
          </svg>
        </div>
      </div>

      {showLabels && (
        <div className="mt-3 sm:mt-4 grid grid-cols-6 gap-2 text-xs sm:text-sm text-neutral-500">
          {(steps?.length ? steps : DEFAULT_STEPS).map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseEnter={() => set(i)}
              onFocus={() => set(i)}
              onClick={() => set(i)}
              className="rounded-xl px-2 py-1 hover:bg-white/70"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
