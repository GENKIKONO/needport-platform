"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetcher } from "../../_parts/useSWRFetcher";
import Badge from "../../_parts/Badge";
import Card from "../../_parts/Card";
import Skeleton from "../../_parts/Skeleton";
import Modal from "../../_parts/Modal";
import Toast, { useToast } from "../../_parts/Toast";

type Need = {
  id: string;
  title: string;
  summary: string;
  region?: string;
  category?: string;
  deadline?: string | null;
  created_at?: string;
  proposals_count?: number;
};

export default function NeedsV2Page() {
  const sp = useSearchParams();
  const router = useRouter();
  const { push } = router;
  const q = sp.get("q") ?? "";
  const region = sp.get("region") ?? "";
  const category = sp.get("category") ?? "";
  const page = Number(sp.get("page") ?? "1");
  const per = Number(sp.get("per") ?? "12");

  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  if (region) qs.set("region", region);
  if (category) qs.set("category", category);
  qs.set("page", String(page));
  qs.set("per", String(per));

  const { data, error, isLoading, mutate } = useSWR<{ rows: Need[]; total: number }>(
    `/api/needs/list?${qs.toString()}`,
    fetcher,
    { refreshInterval: 4000, revalidateOnFocus: false }
  );

  const [open, setOpen] = useState<string | null>(null);
  const { toast, Toaster } = useToast();

  const onReset = () => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("per", String(per));
    push(`/v2/needs?${params.toString()}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <Toaster />
      <h1 className="text-2xl font-semibold">ニーズ一覧</h1>

      {/* Filters（URLパラ連動の簡易版） */}
      <div className="grid gap-2 sm:grid-cols-4">
        <input
          placeholder="キーワード"
          className="border rounded px-3 py-2"
          defaultValue={q}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const params = new URLSearchParams(sp.toString());
              const v = (e.target as HTMLInputElement).value;
              if (v) params.set("q", v); else params.delete("q");
              params.set("page", "1");
              push(`/v2/needs?${params.toString()}`);
            }
          }}
        />
        <input
          placeholder="地域"
          className="border rounded px-3 py-2"
          defaultValue={region}
          onBlur={(e) => {
            const params = new URLSearchParams(sp.toString());
            const v = e.target.value;
            if (v) params.set("region", v); else params.delete("region");
            params.set("page", "1");
            push(`/v2/needs?${params.toString()}`);
          }}
        />
        <input
          placeholder="カテゴリ"
          className="border rounded px-3 py-2"
          defaultValue={category}
          onBlur={(e) => {
            const params = new URLSearchParams(sp.toString());
            const v = e.target.value;
            if (v) params.set("category", v); else params.delete("category");
            params.set("page", "1");
            push(`/v2/needs?${params.toString()}`);
          }}
        />
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded border" onClick={onReset}>リセット</button>
          <a href="/v2/needs/new" className="px-3 py-2 rounded bg-sky-600 text-white">5W1Hで投稿</a>
        </div>
      </div>

      {/* Meta */}
      {data && (
        <div className="text-sm text-slate-500">
          全{data.total}件中 {data.rows.length}件を表示
        </div>
      )}

      {/* List */}
      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton.Card key={i} />)}
        </div>
      )}
      {error && (
        <div className="text-red-600">読み込みエラーが発生しました。リロードしてください。</div>
      )}
      {!isLoading && !error && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data?.rows?.map((n) => (
            <Card key={n.id}>
              <Card.Header>
                <div className="font-medium line-clamp-2">{n.title}</div>
                <div className="flex gap-2">
                  {n.deadline && <Badge color="amber">期限 {new Date(n.deadline).toLocaleDateString()}</Badge>}
                  {typeof n.proposals_count === "number" && <Badge color="sky">提案 {n.proposals_count}</Badge>}
                </div>
              </Card.Header>
              <Card.Body>
                <p className="text-sm text-slate-700 line-clamp-3">{n.summary}</p>
                <div className="mt-2 text-xs text-slate-500 space-x-2">
                  {n.region && <span>地域: {n.region}</span>}
                  {n.category && <span>カテゴリ: {n.category}</span>}
                </div>
              </Card.Body>
              <Card.Footer>
                <a className="px-3 py-2 rounded border" href={`/needs/${n.id}`}>詳細を見る</a>
                <button className="px-3 py-2 rounded bg-amber-600 text-white" onClick={() => setOpen(n.id)}>
                  かんたん提案
                </button>
              </Card.Footer>

              {/* Quick Proposal Modal */}
              <Modal open={open === n.id} onClose={() => setOpen(null)} title="かんたん提案">
                <form
                  className="space-y-3"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const body = {
                      needId: n.id,
                      title: String(fd.get("title") || ""),
                      body: String(fd.get("body") || ""),
                      estimate_price: Number(fd.get("estimate_price") || 0) || null
                    };
                    const res = await fetch("/api/proposals/create", {
                      method: "POST",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify(body)
                    });
                    if (res.ok) {
                      toast("提案を送信しました。承認後に相手へ表示されます。");
                      setOpen(null);
                      mutate();
                    } else {
                      const j = await res.json().catch(()=>({}));
                      toast(j?.error ? `送信失敗: ${j.error}` : "送信に失敗しました", "error");
                    }
                  }}
                >
                  <input name="title" placeholder="件名（任意）" className="w-full border rounded px-3 py-2" />
                  <textarea name="body" placeholder="提案内容（必須）" required className="w-full border rounded px-3 py-2 min-h-[120px]" />
                  <input name="estimate_price" type="number" placeholder="概算金額（任意）" className="w-full border rounded px-3 py-2" />
                  <div className="flex justify-end gap-2">
                    <button type="button" className="px-3 py-2 rounded border" onClick={()=>setOpen(null)}>キャンセル</button>
                    <button type="submit" className="px-3 py-2 rounded bg-sky-600 text-white">送信</button>
                  </div>
                </form>
              </Modal>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination（簡易） */}
      <div className="flex justify-center gap-2 pt-4">
        <button
          className="px-3 py-2 rounded border disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => {
            const params = new URLSearchParams(sp.toString());
            params.set("page", String(Math.max(1, page - 1)));
            push(`/v2/needs?${params.toString()}`);
          }}
        >前へ</button>
        <button
          className="px-3 py-2 rounded border"
          onClick={() => {
            const params = new URLSearchParams(sp.toString());
            params.set("page", String(page + 1));
            push(`/v2/needs?${params.toString()}`);
          }}
        >次へ</button>
      </div>
    </div>
  );
}
