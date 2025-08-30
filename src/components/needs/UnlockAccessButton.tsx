"use client";
import { useState } from "react";
import { startFlatUnlock } from "@/lib/billing/client";

export function UnlockAccessButton({ needId }: { needId: string }) {
  const [loading, setLoading] = useState(false);
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
