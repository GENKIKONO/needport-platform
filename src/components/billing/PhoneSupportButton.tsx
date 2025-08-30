"use client";
import { useState } from "react";
import { startPhoneSupportSubscription } from "@/lib/billing/client";

export function PhoneSupportButton() {
  const [loading, setLoading] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          setLoading(true);
          await startPhoneSupportSubscription();
        } finally {
          setLoading(false);
        }
      }}
      className="inline-flex items-center px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
      disabled={loading}
    >
      {loading ? "リダイレクト中…" : "電話サポート（月額）を申し込む"}
    </button>
  );
}
