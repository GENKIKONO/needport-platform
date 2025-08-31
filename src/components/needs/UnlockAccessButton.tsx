"use client";
import { useState } from "react";
import Link from 'next/link';
import { startFlatUnlock } from "@/lib/billing/client";
import { flags } from '@/config/flags';

export function UnlockAccessButton({ needId }: { needId: string }) {
  const [loading, setLoading] = useState(false);

  if (!flags.paymentsEnabled) {
    return (
      <div className="rounded border p-4 text-sm space-y-2">
        <p className="text-muted-foreground">
          個人情報は解放前は伏字で表示されます。現在オンライン決済は準備中です。
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/me" className="px-3 py-2 rounded border">マイページ</Link>
          <Link href="/vendor/dashboard" className="px-3 py-2 rounded border">事業者ダッシュ</Link>
        </div>
      </div>
    );
  }
  // 決済ONになったら本来の「閲覧解放」ボタンへ（後日差し替え）
  return <button className="px-3 py-2 rounded bg-emerald-600 text-white">閲覧を解放する</button>;
}
