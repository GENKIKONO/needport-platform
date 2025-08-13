"use client";
import { useState } from "react";

export default function OfferUnadoptButton({ needId }: { needId: string }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onClick() {
    if (!confirm("採用を解除しますか？")) return;
    setLoading(true); setErr(null);
    try {
      const res = await fetch(`/api/admin/needs/${needId}/adopt`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId: null }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "解除に失敗しました");
      window.location.reload();
    } catch (e:any) {
      setErr(e?.message ?? "解除に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-end">
      <button
        onClick={onClick}
        disabled={loading}
        className="h-8 rounded-lg border border-red-500/40 bg-red-600/20 px-3 text-sm text-red-200 hover:bg-red-600/30 disabled:opacity-50"
      >
        {loading ? "解除中..." : "採用解除"}
      </button>
      {err && <div className="mt-1 text-[11px] text-red-400">{err}</div>}
    </div>
  );
}
