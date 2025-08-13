"use client";

import { useState } from "react";

export default function OfferEditButton(props: {
  offerId: string;
  currentVendor?: string | null;
  currentAmount?: number | null;
}) {
  const { offerId, currentVendor, currentAmount } = props;
  const [open, setOpen] = useState(false);
  const [vendorName, setVendorName] = useState(currentVendor ?? "");
  const [amount, setAmount] = useState<string>(currentAmount != null ? String(currentAmount) : "");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setOk(false);
    const n = Number(amount);
    if (!vendorName.trim()) return setErr("提供者名は必須です");
    if (!Number.isFinite(n) || n <= 0) return setErr("金額は正の数で入力してください");

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/offers/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorName: vendorName.trim(), amount: n }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "更新に失敗しました");
      setOk(true);
      // 反映
      setTimeout(() => {
        setOpen(false);
        window.location.reload();
      }, 400);
    } catch (e: any) {
      setErr(e?.message ?? "更新に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-8 rounded-lg border border-blue-500/40 bg-blue-600/20 px-3 text-sm text-blue-200 hover:bg-blue-600/30"
        aria-label="編集"
      >
        編集
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <form
            onSubmit={onSubmit}
            className="w-full max-w-sm rounded-xl bg-zinc-900 p-4 shadow-xl ring-1 ring-white/10"
          >
            <h3 className="mb-3 text-sm font-semibold">オファーを編集</h3>

            <label className="mb-2 block text-xs opacity-70">提供者名</label>
            <input
              className="mb-3 w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm outline-none ring-1 ring-white/10"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="例: A社"
            />

            <label className="mb-2 block text-xs opacity-70">金額（円）</label>
            <input
              className="mb-3 w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm outline-none ring-1 ring-white/10"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
              inputMode="numeric"
              placeholder="450000"
            />

            {err && <div className="mb-3 text-xs text-red-400">{err}</div>}
            {ok && <div className="mb-3 text-xs text-emerald-400">更新しました</div>}

            <div className="mt-1 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-1.5 text-xs hover:bg-white/5"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-3 py-1.5 text-xs text-emerald-200 hover:bg-emerald-600/30 disabled:opacity-50"
              >
                {loading ? "更新中..." : "更新する"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
