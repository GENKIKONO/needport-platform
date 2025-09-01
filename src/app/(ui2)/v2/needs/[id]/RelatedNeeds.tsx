"use client";
import useSWR from "swr";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import fetcher from "@/app/(ui2)/_parts/useSWRFetcher";

export default function RelatedNeeds({ region, category, excludeId }:{
  region?: string; category?: string; excludeId: string;
}) {
  const qs = new URLSearchParams();
  if (region) qs.set("region", region);
  if (category) qs.set("category", category);
  qs.set("per", "6");
  const { data, error, isLoading } = useSWR<{ rows: any[]; total: number }>(
    `/api/needs/list?${qs.toString()}`,
    fetcher,
    { refreshInterval: 10000, revalidateOnFocus: false }
  );

  const rows = (data?.rows || []).filter((n:any)=> n.id !== excludeId).slice(0, 6);

  if (isLoading) {
    return (
      <section className="rounded-lg border bg-white p-4">
        <h3 className="font-medium text-slate-900 mb-2">関連するニーズ</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({length:6}).map((_,i)=>(<div key={i} className="h-24 rounded bg-slate-100 animate-pulse" />))}
        </div>
      </section>
    );
  }
  if (error || rows.length === 0) return null;

  return (
    <section className="rounded-lg border bg-white p-4">
      <h3 className="font-medium text-slate-900 mb-2">関連するニーズ</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((n:any)=>(
          <Link key={n.id} href={`/v2/needs/${n.id}`} className="rounded border p-3 hover:bg-slate-50">
            <div className="font-medium line-clamp-2">{n.title}</div>
            <div className="text-xs text-slate-500 mt-1">
              {n.region || "—"} / {n.category || "—"}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
