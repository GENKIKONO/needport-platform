"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";

export default function OfferAddForm({
  needId,
  onAdded,
}: {
  needId: string;
  onAdded?: () => void;
}) {
  const [vendorName, setVendorName] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const amt = Number(amount);
    if (!vendorName.trim()) {
      toast.error("提供者名を入力してください。");
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error("金額は正の数で入力してください。");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          needId,
          vendorName: vendorName.trim(),
          amount: amt,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        if (res.status === 409 && json?.error === "DUPLICATE_VENDOR") {
          throw new Error("同じ提供者のオファーは既に存在します");
        }
        throw new Error(json?.error || "追加に失敗しました。");
      }
      toast.success("オファーを追加しました。");
      setVendorName("");
      setAmount("");
      // 画面更新（親に任せる or 自前でリロード）
      if (onAdded) onAdded();
      else window.location.reload();
    } catch (e: any) {
      toast.error(e?.message ?? "追加に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border p-4 space-y-3 bg-card">
      <div className="text-sm font-medium">オファーを追加</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="block mb-1 opacity-70">提供者名</span>
          <input
            type="text"
            className="w-full rounded border bg-transparent px-3 py-2"
            placeholder="例：A社"
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
          />
        </label>

        <label className="text-sm">
          <span className="block mb-1 opacity-70">金額（円）</span>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-full rounded border bg-transparent px-3 py-2"
            placeholder="例：500000"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-emerald-600 text-white px-4 py-2 disabled:opacity-50"
        >
          {loading ? "追加中..." : "追加する"}
        </button>


      </div>
    </form>
  );
}
