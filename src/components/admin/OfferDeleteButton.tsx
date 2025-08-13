"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import DemoGuard from "@/components/DemoGuard";

export default function OfferDeleteButton({ offerId }: { offerId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const onClick = async () => {
    setErr(null);
    if (!window.confirm("このオファーを削除します。よろしいですか？")) return;
    try {
      const res = await fetch(`/api/admin/offers/${offerId}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) throw new Error(json?.error || "削除に失敗しました。");
      startTransition(() => router.refresh()); // 一覧を再取得
    } catch (e: any) {
      setErr(e?.message ?? "削除に失敗しました。");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DemoGuard destructive tooltip="デモモード中">
        <button
          type="button"
          onClick={onClick}
          disabled={pending}
          className="h-8 rounded-lg border border-rose-500/40 bg-rose-600/20 px-3 text-sm text-rose-200 hover:bg-rose-600/30 disabled:opacity-50"
        >
          {pending ? "削除中..." : "削除"}
        </button>
      </DemoGuard>
      {err && <span className="text-xs text-rose-500">{err}</span>}
    </div>
  );
}
