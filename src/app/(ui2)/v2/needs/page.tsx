"use client";
import useSWR from "swr";
import { fetcher } from "../../_parts/useSWRFetcher";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

type Need = {
  id: string;
  title: string;
  summary: string;
  region?: string;
  category?: string;
  deadline?: string | null;
  created_at?: string;
  proposals_count?: number;
  industry_name?: string;
};

function deadlineColor(d?:string){
  if (!d) return "bg-slate-100 text-slate-700 border";
  const diff = (new Date(d).getTime() - Date.now())/(86400000);
  if (diff < 0) return "bg-red-50 text-red-700 border border-red-200";
  if (diff <= 3) return "bg-amber-50 text-amber-700 border border-amber-200";
  return "bg-slate-100 text-slate-700 border";
}

export default function NeedsV2Page(){
  const sp = useSearchParams();
  const router = useRouter();
  const q = sp.get("q") || "";
  const region = sp.get("region") || "";
  const category = sp.get("category") || "";
  const page = Math.max(1, parseInt(sp.get("page")||"1",10));
  const per = 12;

  const qs = new URLSearchParams();
  if (q) qs.set("q",q);
  if (region) qs.set("region",region);
  if (category) qs.set("category",category);
  qs.set("page", String(page));
  qs.set("per", String(per));

  const { data, error, isLoading } = useSWR<{ rows:any[]; total:number }>(`/api/needs/list?${qs.toString()}`, fetcher, { refreshInterval: 8000, revalidateOnFocus:false });

  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / per));
  const rows = data?.rows || [];

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center gap-2 justify-between">
        <h1 className="text-2xl font-bold">ニーズ一覧</h1>
        <div className="flex gap-2">
          <input
            defaultValue={q}
            placeholder="キーワード検索"
            className="border rounded px-3 py-1.5 text-sm"
            onKeyDown={(e)=>{ if(e.key==='Enter'){ const p = new URLSearchParams(sp as any); const v=(e.target as HTMLInputElement).value; v ? p.set('q',v) : p.delete('q'); p.set('page','1'); router.push(`/v2/needs?${p.toString()}`); }}}
          />
        </div>
      </header>

      <div className="text-xs text-slate-500">{total ? `${total}件中 ${(page-1)*per+1}–${Math.min(page*per,total)} を表示` : isLoading ? "読み込み中…" : "該当なし"}</div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({length:6}).map((_,i)=>(<div key={i} className="h-32 rounded bg-slate-100 animate-pulse" />))}
        </div>
      ) : error ? (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-red-700">読み込みに失敗しました。</div>
      ) : rows.length === 0 ? (
        <div className="rounded border bg-white p-4">条件に一致するニーズが見つかりませんでした。</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((n:any)=>(
            <Link key={n.id} href={`/v2/needs/${n.id}`} className="rounded border bg-white p-3 hover:bg-slate-50">
              <div className="flex items-start justify-between gap-2">
                <div className="font-medium line-clamp-2">{n.title}</div>
                <span className={`text-[11px] px-2 py-0.5 rounded ${deadlineColor(n.deadline)}`}>{n.deadline ? `期限 ${new Date(n.deadline).toLocaleDateString()}` : "期限—"}</span>
              </div>
              <div className="mt-1 text-sm text-slate-600 line-clamp-3">{n.summary}</div>
              <div className="mt-2 text-xs text-slate-500">{n.region || "—"} / {n.category || "—"}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {/* 提案枚数（公開APIの count-by-need を使うなら別途SWR化可。ここは最小表示の例） */}
                {typeof n.proposals_count === 'number' && (
                  <span className="px-2 py-0.5 text-[11px] rounded bg-slate-100 border">提案 {n.proposals_count}</span>
                )}
                {n.industry_name && (
                  <span className="px-2 py-0.5 text-[11px] rounded bg-slate-100 border">{n.industry_name}</span>
                )}
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                ※ メッセージ・提案は<b>管理者承認後</b>に相手に表示されます
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages>1 && (
        <div className="flex items-center justify-center gap-2">
          <a aria-disabled={page<=1} className={`px-3 py-1.5 rounded border ${page<=1 ? "pointer-events-none opacity-50" : "hover:bg-slate-50"}`} href={`/v2/needs?${new URLSearchParams({...Object.fromEntries(sp.entries()), page:String(page-1)})}`}>前へ</a>
          <span className="text-sm">{page}/{totalPages}</span>
          <a aria-disabled={page>=totalPages} className={`px-3 py-1.5 rounded border ${page>=totalPages ? "pointer-events-none opacity-50" : "hover:bg-slate-50"}`} href={`/v2/needs?${new URLSearchParams({...Object.fromEntries(sp.entries()), page:String(page+1)})}`}>次へ</a>
        </div>
      )}
    </div>
  );
}
