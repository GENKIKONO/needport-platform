"use client";
import { useState } from "react";

export default function OfferAdoptButton(props: { needId: string; offerId: string }) {
  const { needId, offerId } = props;
  const [open, setOpen] = useState(false);
  const [minPeople, setMinPeople] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Validation functions
  const validateMinPeople = (value: string) => {
    if (!value) return null;
    const num = Number(value);
    if (!Number.isInteger(num) || num <= 0) {
      return "最低人数は正の整数で入力してください";
    }
    return null;
  };

  const validateDeadline = (value: string) => {
    if (!value) return null;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      return "日付は YYYY-MM-DD 形式で入力してください";
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return "有効な日付を入力してください";
    }
    return null;
  };

  const minPeopleError = validateMinPeople(minPeople);
  const deadlineError = validateDeadline(deadline);
  const hasErrors = minPeopleError || deadlineError;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    
    if (hasErrors) return;
    
    const mp = minPeople ? Number(minPeople) : undefined;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/needs/${needId}/adopt`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId, minPeople: mp, deadline: deadline || undefined }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "採用に失敗しました");
      window.location.reload();
    } catch (e:any) {
      setErr(e?.message ?? "採用に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-8 rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-3 text-sm text-emerald-200 hover:bg-emerald-600/30"
      >
        採用
      </button>
      {open && (
        <div 
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="adopt-dialog-title"
        >
          <form onSubmit={submit} className="w-full max-w-sm rounded-xl bg-zinc-900 p-4 ring-1 ring-white/10">
            <h3 id="adopt-dialog-title" className="mb-3 text-sm font-semibold">このオファーを採用</h3>

            <label className="mb-2 block text-xs opacity-70">最低人数（任意）</label>
            <input
              className={`mb-1 w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm outline-none ring-1 ${
                minPeopleError ? "ring-red-500" : "ring-white/10"
              }`}
              value={minPeople}
              onChange={(e)=>setMinPeople(e.target.value.replace(/[^\d]/g,""))}
              inputMode="numeric"
              placeholder="例: 10"
            />
            {minPeopleError && (
              <div className="mb-3 text-xs text-red-400" aria-live="polite">
                {minPeopleError}
              </div>
            )}

            <label className="mb-2 block text-xs opacity-70">締切（任意・YYYY-MM-DD）</label>
            <input
              className={`mb-1 w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm outline-none ring-1 ${
                deadlineError ? "ring-red-500" : "ring-white/10"
              }`}
              value={deadline}
              onChange={(e)=>setDeadline(e.target.value)}
              placeholder="2025-12-31"
            />
            {deadlineError && (
              <div className="mb-3 text-xs text-red-400" aria-live="polite">
                {deadlineError}
              </div>
            )}

            {err && (
              <div className="mb-3 text-xs text-red-400" aria-live="polite">
                {err}
              </div>
            )}

            <div className="mt-1 flex justify-end gap-2">
              <button type="button" onClick={()=>setOpen(false)} className="rounded-lg px-3 py-1.5 text-xs hover:bg-white/5">キャンセル</button>
              <button 
                type="submit" 
                disabled={loading || hasErrors} 
                aria-busy={loading}
                className="rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-3 py-1.5 text-xs text-emerald-200 hover:bg-emerald-600/30 disabled:opacity-50"
              >
                {loading ? "設定中..." : "設定する"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
