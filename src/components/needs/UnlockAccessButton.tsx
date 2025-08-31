"use client";
import { useState } from "react";
import { startFlatUnlock } from "@/lib/billing/client";
import { flags } from '@/config/flags';

export function UnlockAccessButton({ needId }: { needId: string }) {
  const [loading, setLoading] = useState(false);

  if (!flags.paymentsEnabled) {
    return (
      <div className="rounded border p-4 space-y-2">
        <div className="font-medium">見積・連絡を依頼</div>
        <p className="text-sm text-muted-foreground">オンライン決済は準備中です。依頼後、事務局/事業者からご連絡します。</p>
        <button className="px-3 py-2 rounded bg-blue-600 text-white">依頼を送信</button>
      </div>
    );
  }
  // 決済ONになったら本来の「閲覧解放」ボタンへ（後日差し替え）
  return <button className="px-3 py-2 rounded bg-emerald-600 text-white">閲覧を解放する</button>;
}
