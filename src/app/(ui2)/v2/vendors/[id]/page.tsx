"use client";
import useSWR from "swr";
import { useParams } from "next/navigation";
import fetcher from "@/app/(ui2)/_parts/useSWRFetcher";
import Link from "next/link";

export default function VendorPublicProfilePage(){
  const { id } = useParams() as { id:string };
  const { data, error, isLoading } = useSWR<{ row?: any }>(`/api/vendors?id=${encodeURIComponent(id)}`, fetcher, { refreshInterval: 10000, revalidateOnFocus:false });
  if (isLoading) return <div className="space-y-3"><div className="h-8 w-2/3 rounded bg-slate-100 animate-pulse"/><div className="h-6 w-1/2 rounded bg-slate-100 animate-pulse"/><div className="h-28 rounded bg-slate-100 animate-pulse"/></div>;
  if (error || !data?.row) return <div className="rounded border bg-white p-4">事業者情報が見つかりませんでした。</div>;
  const v = data.row;
  return (
    <div className="space-y-5">
      <header className="flex items-center gap-4">
        {v.avatar_url ? <img src={v.avatar_url} alt="" className="w-16 h-16 rounded-full border object-cover"/> : <div className="w-16 h-16 rounded-full border bg-slate-100"/>}
        <div>
          <h1 className="text-2xl font-bold">{v.name || "事業者"}</h1>
          <div className="text-slate-600 text-sm">{v.public_areas || "対応エリア：—"}</div>
          {Array.isArray(v.industries) && v.industries.length>0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {v.industries.map((n:string, i:number)=>(
                <span key={i} className="px-2 py-0.5 text-xs rounded bg-slate-100 border">{n}</span>
              ))}
            </div>
          )}
          {v.any_fee_blocked && (
            <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 inline-block">
              成果報酬対象外カテゴリを含みます（顔出し＋月額）
            </div>
          )}
        </div>
      </header>

      <section className="rounded border bg-white p-4">
        <h3 className="font-medium text-slate-900">事業者情報</h3>
        <dl className="grid sm:grid-cols-2 gap-3 mt-2 text-sm">
          <div><dt className="text-slate-500">免許/許可</dt><dd className="text-slate-900">{v.license_no || "—"}</dd></div>
          <div><dt className="text-slate-500">Web</dt><dd className="text-slate-900">{v.website ? <a className="text-sky-700 underline" href={v.website} target="_blank">サイトを開く</a> : "—"}</dd></div>
        </dl>
        <p className="text-xs text-slate-500 mt-2">
          ※ NeedPortでは <b>匿名で条件を合わせてから顔合わせ</b> するフローを基本としています。成果報酬対象外カテゴリ（例：介護タクシー）は始めから事業者公開、ユーザー情報は承認/成約で必要範囲のみ開示されます。
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/needs" className="rounded-md border px-4 py-2 text-sm hover:bg-slate-50">ニーズを探す</Link>
      </div>
    </div>
  );
}
