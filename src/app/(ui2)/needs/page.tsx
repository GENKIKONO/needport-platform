import HeaderV2 from "../_parts/Header";
import FooterV2 from "../_parts/Footer";
import { Card, CardBody } from "../_parts/Card";
import { Badge } from "../_parts/Badge";
import { ListSkeleton } from "../_parts/Skeleton";
import FiltersClient from "./FiltersClient";
import QuickProposal from "./QuickProposal";

export const dynamic = "force-dynamic";

async function getData(searchParams: Record<string,string>) {
  const baseUrl = process.env.PLATFORM_ORIGIN || "http://localhost:3000";
  const u = new URL(`${baseUrl}/api/needs/list`);
  // 既存APIのパラメータ（q, region, category, page, per）に合わせて転送
  const forward = ["q","region","category","page","per"];
  forward.forEach(k=>{ if(searchParams?.[k]) u.searchParams.set(k, searchParams[k]); });
  if(!u.searchParams.get('per')) u.searchParams.set('per','12');
  if(!u.searchParams.get('page')) u.searchParams.set('page','1');
  const res = await fetch(u.toString(), { cache:"no-store" }).catch(()=>null);
  if (!res || !res.ok) return { rows: [], total: 0, page: 1, per: 12 };
  return res.json();
}

export default async function NeedsV2({ searchParams }:{ searchParams: Record<string,string> }){
  const dataPromise = getData(searchParams);
  // すぐにawaitしても良いが、将来SWR置換しやすいよう分離
  const data = await dataPromise;
  const rows = data.rows || [];
  return (
    <>
      <HeaderV2/>
      <main className="max-w-6xl mx-auto px-3 py-6">
        <h2 className="text-xl font-semibold mb-4">ニーズ一覧（v2）</h2>
        <FiltersClient/>
        {rows.length === 0 && <div className="text-slate-500 text-sm">該当するニーズがありません</div>}
        {rows.length === 0 ? <ListSkeleton/> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map((n:any)=>(
              <Card key={n.id}>
                <CardBody>
                  <div className="flex items-start justify-between gap-2">
                    <a href={`/needs/${n.id}`} className="font-medium hover:underline">{n.title || '（無題）'}</a>
                    {n.deadline && <Badge tone="amber">期限 {new Date(n.deadline).toLocaleDateString()}</Badge>}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{n.region} / {n.category}</div>
                  <p className="mt-2 text-sm text-slate-700 line-clamp-3">{n.summary}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <a href={`/needs/${n.id}`} className="px-3 py-2 rounded border text-sm">詳細</a>
                    <QuickProposal need={n}/>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </main>
      <FooterV2/>
    </>
  );
}
