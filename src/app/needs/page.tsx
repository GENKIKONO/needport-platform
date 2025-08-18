"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type NeedRow = {
  id: string;
  title: string;
  description?: string;
  stage: string;
  supporters: number;
  proposals: number;
  estimateYen?: number | null;
  updatedAt: string;
};

type Resp = {
  items: NeedRow[];
  total: number;
  page: number;
  pageSize: number;
};

export default function PublicNeedsList() {
  const [data, setData] = useState<Resp | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load(p = page) {
    try {
      setLoading(true);
      setErr(null);
      const res = await fetch(`/api/needs?page=${p}&pageSize=${pageSize}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json() as Resp;
      setData(json);
      setPage(json.page);
    } catch (e:any) {
      setErr(e?.message ?? "failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(1); }, []);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const go = (p:number) => {
    const clamped = Math.max(1, Math.min(pageCount, p));
    if (clamped !== page) load(clamped);
  };

  return (
    <main className="container py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">ニーズ一覧</h1>
          <p className="text-sm text-neutral-500 mt-1">公開中のニーズを表示しています</p>
        </div>
        <div className="text-xs text-neutral-500">
          {data ? <>Page {page} / {pageCount}</> : null}
        </div>
      </div>

      {err ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-800 text-sm">
          読み込みに失敗しました（{err}）
          <button onClick={() => load(page)} className="ml-3 underline">再試行</button>
        </div>
      ) : null}

      {loading && !data ? (
        <div className="text-sm text-neutral-500">読み込み中...</div>
      ) : null}

      {!loading && data && items.length === 0 ? (
        <div className="rounded-xl border border-black/5 bg-white p-6 text-neutral-600">
          現在、公開中のニーズはありません。
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((n) => {
          const excerpt = (n.description ?? "").replace(/\s+/g, " ").slice(0, 120);
          const meta = [
            new Date(n.updatedAt).toLocaleDateString(),
            `賛同 ${n.supporters}`,
            `提案 ${n.proposals}`,
            n.estimateYen ? `目安 ¥${n.estimateYen.toLocaleString()}` : undefined,
          ].filter(Boolean).join("・");

          const stageColor =
            n.stage === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
            n.stage === "proposed" ? "bg-amber-50 text-amber-800 border-amber-200" :
            n.stage === "in_progress" ? "bg-sky-50 text-sky-700 border-sky-200" :
            "bg-slate-50 text-slate-700 border-slate-200";

          return (
            <article key={n.id} className="rounded-2xl border border-black/5 shadow-card bg-white p-4 hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${stageColor}`}>
                  {n.stage}
                </span>
              </div>
              <h3 className="text-base font-semibold text-neutral-900 line-clamp-2">
                <Link href={`/needs/${n.id}`} aria-label={`「${n.title}」の詳細を見る`} className="hover:underline">
                  {n.title}
                </Link>
              </h3>
              {excerpt && (
                <p className="mt-2 text-sm text-neutral-600 line-clamp-3">{excerpt}{(n.description ?? "").length > 120 ? "…" : ""}</p>
              )}
              <div className="mt-3 text-xs text-neutral-500">{meta}</div>
              <div className="mt-4">
                <Link href={`/needs/${n.id}`} className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-50">
                  詳細を見る
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {data && pageCount > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button onClick={() => go(1)}    disabled={page<=1} className="rounded border px-3 py-1 text-sm disabled:opacity-50">≪ 最初</button>
          <button onClick={() => go(page-1)} disabled={page<=1} className="rounded border px-3 py-1 text-sm disabled:opacity-50">‹ 前へ</button>
          <span className="text-xs text-neutral-500 px-2">Page {page} / {pageCount}</span>
          <button onClick={() => go(page+1)} disabled={page>=pageCount} className="rounded border px-3 py-1 text-sm disabled:opacity-50">次へ ›</button>
          <button onClick={() => go(pageCount)} disabled={page>=pageCount} className="rounded border px-3 py-1 text-sm disabled:opacity-50">最後 ≫</button>
        </div>
      )}
    </main>
  );
}
