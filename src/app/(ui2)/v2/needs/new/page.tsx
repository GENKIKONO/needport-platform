"use client";

import { useState } from "react";
import Toast, { useToast } from "../../../_parts/Toast";

// 投稿フォームは常に最新（CSRF/認証もある）
export const dynamic = "force-dynamic";

export default function NeedsNewCareTaxiPage() {
  const { toast, Toaster } = useToast();
  const [pending, setPending] = useState(false);

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <Toaster />
      <h1 className="text-2xl font-semibold">介護タクシー依頼（5W1H）</h1>
      <p className="text-sm text-slate-600">
        匿名で条件を合わせてから顔合わせすることでフラットなマッチング。<br/>
        入力内容は審査後に公開されます（個人情報の直書きは控えてください）。
      </p>

      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          const fd = new FormData(e.currentTarget);

          const payload = {
            kind: "care_taxi",
            title: String(fd.get("title") || ""),
            summary: String(fd.get("summary") || ""),
            region: String(fd.get("region") || ""),
            category: "介護タクシー",
            // 5W1H
            when_date: fd.get("when_date") ? String(fd.get("when_date")) : null,
            when_time: fd.get("when_time") ? String(fd.get("when_time")) : null,
            where_from: String(fd.get("where_from") || ""),
            where_to: String(fd.get("where_to") || ""),
            who_count: Number(fd.get("who_count") || 1),
            wheelchair: String(fd.get("wheelchair") || "no") === "yes",
            helpers_needed: Number(fd.get("helpers_needed") || 0),
          };

          const res = await fetch("/api/needs/create", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          });

          setPending(false);
          if (res.ok) {
            (e.currentTarget as HTMLFormElement).reset();
            toast("投稿を受け付けました。審査後に公開されます。");
          } else {
            const j = await res.json().catch(()=> ({}));
            toast(j?.error ? `投稿失敗: ${j.error}` : "投稿に失敗しました", "error");
          }
        }}
      >
        <div className="grid gap-3">
          <input name="title" required placeholder="タイトル（例：結婚式当日の送迎をお願いしたい）" className="border rounded px-3 py-2" />
          <textarea name="summary" required placeholder="概要（個人情報は書かないでください）" className="border rounded px-3 py-2 min-h-[120px]" />
          <input name="region" placeholder="地域（例：高知市）" className="border rounded px-3 py-2" />
        </div>

        <div className="mt-4 border rounded p-3 space-y-2">
          <div className="font-medium">5W1H</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="text-sm text-slate-600">いつ（日付）</span>
              <input type="date" name="when_date" className="border rounded px-3 py-2" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-slate-600">いつ（時間）</span>
              <input type="time" name="when_time" className="border rounded px-3 py-2" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-slate-600">どこから（出発地）</span>
              <input name="where_from" className="border rounded px-3 py-2" placeholder="例：高知市〇〇" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-slate-600">どこへ（到着地）</span>
              <input name="where_to" className="border rounded px-3 py-2" placeholder="例：〇〇式場" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-slate-600">誰（人数）</span>
              <input type="number" min="1" name="who_count" defaultValue={1} className="border rounded px-3 py-2" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-slate-600">車椅子</span>
              <select name="wheelchair" className="border rounded px-3 py-2">
                <option value="no">なし</option>
                <option value="yes">あり</option>
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-slate-600">介助人数</span>
              <input type="number" min="0" name="helpers_needed" defaultValue={0} className="border rounded px-3 py-2" />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <a href="/v2/needs" className="px-3 py-2 rounded border">戻る</a>
          <button type="submit" disabled={pending} className="px-3 py-2 rounded bg-sky-600 text-white disabled:opacity-50">
            {pending ? "送信中..." : "投稿する"}
          </button>
        </div>
      </form>
    </div>
  );
}
