"use client";
import { useState } from "react";

export function RequireAccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function send() {
    if (!email) return;
    setSending(true);
    try {
      await fetch("/api/me/claim/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setDone(true);
    } finally {
      setSending(false);
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-md p-6 w-[92vw] max-w-md">
        <h3 className="text-lg font-semibold">メールで本人確認</h3>
        {done ? (
          <p className="mt-3 text-sm text-gray-600">メールを送信しました。メール内のリンクから続きができます。</p>
        ) : (
          <>
            <p className="mt-2 text-sm text-gray-600">
              賛同・お気に入り・投稿を行うには、メールで本人確認が必要です。
            </p>
            <input
              type="email"
              placeholder="your@email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-3 w-full border rounded px-3 py-2"
            />
            <div className="mt-4 flex gap-2 justify-end">
              <button onClick={onClose} className="px-3 py-2 border rounded">閉じる</button>
              <button onClick={send} disabled={sending || !email} className="px-3 py-2 rounded bg-blue-600 text-white">
                {sending ? "送信中..." : "メールを送る"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
