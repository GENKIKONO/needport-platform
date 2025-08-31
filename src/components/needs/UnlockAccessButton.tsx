"use client";
import { useState } from "react";
import { startFlatUnlock } from "@/lib/billing/client";
import { flags } from '@/config/flags';

export function UnlockAccessButton({ needId }: { needId: string }) {
  const [loading, setLoading] = useState(false);

  // 課金OFF: 代替導線に切り替え
  if (!flags.paymentsEnabled) {
    return (
      <div className="flex flex-col gap-2">
        <a 
          href={`/needs/${needId}/contact`}
          className="inline-flex items-center px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          見積・連絡を依頼
        </a>
        <p className="text-xs text-muted-foreground">
          現在オンライン決済は準備中です。必要に応じて担当者からご案内します。
        </p>
      </div>
    );
  }

  // 課金ON時の表示
  return (
    <button
      onClick={async () => {
        try {
          setLoading(true);
          await startFlatUnlock(needId);
        } finally {
          setLoading(false);
        }
      }}
      className="inline-flex items-center px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
      disabled={loading}
    >
      {loading ? "リダイレクト中…" : "このニーズの連絡先を解放（有料）"}
    </button>
  );
}
