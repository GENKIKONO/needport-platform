"use client";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  need: { id: string; title: string; area?: string; category?: string; budgetLabel?: string };
};

const LEVELS = [
  { key: "buy",   label: "購入したい", detail: "本格的に購入を検討しています", dot: "bg-blue-600" },
  { key: "maybe", label: "欲しいかも", detail: "条件次第で検討したい",         dot: "bg-blue-400" },
  { key: "curious", label: "興味あり", detail: "関心を示すのみ",              dot: "bg-blue-300" },
] as const;

export default function InterestDialog({ open, onClose, need }: Props) {
  const [level, setLevel] = useState<typeof LEVELS[number]["key"]>("buy");
  const [area, setArea] = useState("");
  const [budget, setBudget] = useState("");

  if (!open) return null;

  async function submit() {
    try {
      const res = await fetch(`/api/needs/${need.id}/interest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, area, budget }),
      });
      if (!res.ok) throw new Error(`failed: ${res.status}`);
      onClose();
      // TODO: 任意でトースト
    } catch (e) {
      console.error(e);
      alert("送信に失敗しました。時間をおいてもう一度お試しください。");
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl" onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold">賛同する</h3>
          <button className="btn btn-ghost h-9" onClick={onClose}>×</button>
        </div>

        <div className="mt-2">
          <div className="text-base font-medium">{need.title}</div>
          {(need.area || need.category) && (
            <div className="mt-1 text-sm text-neutral-500">
              {[need.area, need.category].filter(Boolean).join("・")}
            </div>
          )}
          {need.budgetLabel && (
            <div className="mt-2 inline-block rounded-lg bg-neutral-100 px-3 py-1 text-sm text-neutral-700">
              予算感: {need.budgetLabel}
            </div>
          )}
        </div>

        <div className="mt-5 space-y-3">
          <div className="text-sm font-medium text-neutral-700">賛同レベルを選択</div>
          <div className="space-y-2">
            {LEVELS.map((lv) => (
              <button
                key={lv.key}
                type="button"
                onClick={() => setLevel(lv.key)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  level === lv.key ? "border-blue-500 ring-2 ring-blue-200" : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${lv.dot}`} />
                  <div>
                    <div className="font-medium">{lv.label}</div>
                    <div className="text-sm text-neutral-500">{lv.detail}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-sm text-neutral-700">お住まいのエリア</div>
              <input value={area} onChange={(e)=>setArea(e.target.value)} placeholder="市区町村など"
                     className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <div className="mb-1 text-sm text-neutral-700">予算感（任意）</div>
              <input value={budget} onChange={(e)=>setBudget(e.target.value)} placeholder="例: 5万円〜10万円"
                     className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button type="button" className="btn btn-ghost h-11" onClick={onClose}>キャンセル</button>
          <button type="button" className="btn btn-primary h-11" onClick={submit}>賛同を送信</button>
        </div>
      </div>
    </div>
  );
}
