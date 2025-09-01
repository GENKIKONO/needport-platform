"use client";
import useSWR from "swr";
import { useSearchParams, useRouter } from "next/navigation";
import fetcher from "@/app/(ui2)/_parts/useSWRFetcher";
import Link from "next/link";
import { useMemo } from "react";

export default function VendorsV2Page(){
  const sp = useSearchParams();
  const router = useRouter();
  const q = sp.get("q") || "";
  const slug = sp.get("slug") || "";
  const page = Math.max(1, parseInt(sp.get("page")||"1",10));
  const per = 12;

  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  if (slug) qs.set("slug", slug);
  qs.set("page", String(page));
  qs.set("per", String(per));

  const { data, error, isLoading } = useSWR<{ rows:any[]; total:number; inds?:any[] }>(`/api/vendors?${qs.toString()}`, fetcher, { refreshInterval: 8000, revalidateOnFocus:false });

  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / per));
  const rows = data?.rows || [];

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center gap-2 justify-between">
        <h1 className="text-2xl font-bold">事業者リスト</h1>
        <div className="flex gap-2">
          <input
            defaultValue={q}
            placeholder="事業者名・エリアで検索"
            className="border rounded px-3 py-1.5 text-sm"
            onKeyDown={(e)=>{ if(e.key==='Enter'){ const p = new URLSearchParams(sp as any); const v=(e.target as HTMLInputElement).value; v ? p.set('q',v) : p.delete('q'); p.set('page','1'); router.push(`/v2/vendors?${p.toString()}`); }}}
          />
        </div>
      </header>

      {/* カテゴリタブ */}
      <div className="flex flex-wrap gap-2">
        <a href="/v2/vendors" className={`px-3 py-1.5 rounded border ${!slug ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:bg-slate-50"}`}>すべて</a>
        {(data?.inds||[]).map((i:any)=>(
          <a key={i.id} href={`/v2/vendors?slug=${i.slug}`} className={`px-3 py-1.5 rounded border ${slug===i.slug ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:bg-slate-50"}`}>
            {i.name}{i.fee_applicable ? "" : "（成果報酬対象外）"}
          </a>
        ))}
      </div>

      {/* ステータス */}
      <div className="text-xs text-slate-500">{total ? `${total}件中 ${(page-1)*per+1}–${Math.min(page*per,total)} を表示` : isLoading ? "読み込み中…" : "該当する事業者がいません"}</div>

      {/* 一覧 */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({length:6}).map((_,i)=>(<div key={i} className="h-28 rounded bg-slate-100 animate-pulse" />))}
        </div>
      ) : error ? (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-red-700">読み込みに失敗しました。</div>
      ) : rows.length === 0 ? (
        <div className="rounded border bg-white p-4">
          条件に一致する事業者が見つかりませんでした。キーワードやカテゴリを調整してください。
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((v:any)=>(
            <Link key={v.user_id} href={`/v2/vendors/${v.user_id}`} className="p-4 rounded border bg-white hover:bg-slate-50">
              <div className="flex items-center gap-3">
                {v.avatar_url ? <img src={v.avatar_url} alt="" className="w-12 h-12 rounded-full border object-cover"/> : <div className="w-12 h-12 rounded-full border bg-slate-100"/>}
                <div className="min-w-0">
                  <div className="font-medium truncate">{v.name || "事業者"}</div>
                  <div className="text-xs text-slate-500 truncate">{v.public_areas || "—"}</div>
                </div>
              </div>
              {Array.isArray(v.industries) && v.industries.length>0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {v.industries.map((n:string,i:number)=>(
                    <span key={i} className="px-2 py-0.5 text-xs rounded bg-slate-100 border">{n}</span>
                  ))}
                </div>
              )}
              {v.any_fee_blocked && (
                <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                  成果報酬対象外のカテゴリを含みます
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* ページネーション */}
      {totalPages>1 && (
        <div className="flex items-center justify-center gap-2">
          <a aria-disabled={page<=1} className={`px-3 py-1.5 rounded border ${page<=1 ? "pointer-events-none opacity-50" : "hover:bg-slate-50"}`} href={`/v2/vendors?${new URLSearchParams({...Object.fromEntries(sp.entries()), page:String(page-1)})}`}>前へ</a>
          <span className="text-sm">{page}/{totalPages}</span>
          <a aria-disabled={page>=totalPages} className={`px-3 py-1.5 rounded border ${page>=totalPages ? "pointer-events-none opacity-50" : "hover:bg-slate-50"}`} href={`/v2/vendors?${new URLSearchParams({...Object.fromEntries(sp.entries()), page:String(page+1)})}`}>次へ</a>
        </div>
      )}
    </div>
  );
}
