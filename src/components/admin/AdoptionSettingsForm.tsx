"use client";
import { useState } from "react";

export default function AdoptionSettingsForm(props: { 
  needId: string; 
  currentMinPeople?: number | null; 
  currentDeadline?: string | null; 
}) {
  const { needId, currentMinPeople, currentDeadline } = props;
  const [minPeople, setMinPeople] = useState<string>(currentMinPeople?.toString() ?? "");
  const [deadline, setDeadline] = useState<string>(currentDeadline ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const payload: any = {};
      if (minPeople.trim()) {
        const num = Number(minPeople);
        if (!Number.isInteger(num) || num <= 0) {
          setMessage({ type: "error", text: "最低人数は正の整数で入力してください" });
          return;
        }
        payload.minPeople = num;
      } else {
        payload.minPeople = null;
      }

      if (deadline.trim()) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(deadline)) {
          setMessage({ type: "error", text: "日付は YYYY-MM-DD 形式で入力してください" });
          return;
        }
        const date = new Date(deadline);
        if (isNaN(date.getTime())) {
          setMessage({ type: "error", text: "有効な日付を入力してください" });
          return;
        }
        payload.deadline = deadline;
      } else {
        payload.deadline = null;
      }

      const res = await fetch(`/api/admin/needs/${needId}/adoption-settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "更新に失敗しました");
      }

      setMessage({ type: "success", text: "設定を更新しました" });
      setTimeout(() => setMessage(null), 3000);
    } catch (e: any) {
      setMessage({ type: "error", text: e?.message ?? "更新に失敗しました" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 text-xs">
      <label className="flex items-center gap-1">
        <span>最低人数:</span>
        <input
          type="text"
          value={minPeople}
          onChange={(e) => setMinPeople(e.target.value.replace(/[^\d]/g, ""))}
          className="w-16 rounded bg-zinc-800 px-2 py-1 outline-none ring-1 ring-white/10"
          placeholder="10"
        />
      </label>
      
      <label className="flex items-center gap-1">
        <span>締切:</span>
        <input
          type="text"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-24 rounded bg-zinc-800 px-2 py-1 outline-none ring-1 ring-white/10"
          placeholder="2025-12-31"
        />
      </label>
      
      <button
        type="submit"
        disabled={loading}
        className="rounded border border-emerald-500/40 bg-emerald-600/20 px-2 py-1 text-emerald-200 hover:bg-emerald-600/30 disabled:opacity-50"
      >
        {loading ? "更新中..." : "更新"}
      </button>
      
      {message && (
        <span className={message.type === "success" ? "text-emerald-400" : "text-red-400"}>
          {message.text}
        </span>
      )}
    </form>
  );
}
