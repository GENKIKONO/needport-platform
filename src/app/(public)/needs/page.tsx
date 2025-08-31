import Filters from '@/components/needs/Filters';
import NeedCard from '@/components/needs/Card';

async function fetchNeeds(searchParams: Record<string,string|undefined>) {
  const qs = new URLSearchParams();
  for (const k of ['q','region','cat','sort','page','per']) if (searchParams[k]) qs.set(k, String(searchParams[k]));
  const res = await fetch(`${process.env.PLATFORM_ORIGIN}/api/needs/list?`+qs.toString(), { cache: 'no-store', headers: {'x-needport-internal':'1'} });
  if (!res.ok) return { rows: [], page:1, per:12, total:0 };
  return res.json();
}
export const dynamic = 'force-dynamic';

export default async function NeedsPage({ searchParams }: { searchParams: Record<string,string|undefined> }) {
  const { rows, page, per, total } = await fetchNeeds(searchParams);
  const pages = Math.max(1, Math.ceil(total / per));
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">ニーズ一覧</h1>
      <Filters/>
      {rows.length === 0 ? (
        <div className="border rounded p-8 text-center text-sm text-muted-foreground">該当するニーズがありません。条件を調整してください。</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((n:any)=> <NeedCard key={n.id} item={n} />)}
        </div>
      )}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-muted-foreground">{total}件中 {(page-1)*per+1}–{Math.min(total, page*per)} を表示</div>
        <div className="flex gap-2">
          <a className={`px-3 py-1 rounded border ${page<=1?'pointer-events-none opacity-40':''}`} href={`/needs?${new URLSearchParams({ ...Object.fromEntries(Object.entries(searchParams).filter(([k])=>!['page'].includes(k))), page:String(page-1), per:String(per) }).toString()}`}>前へ</a>
          <a className={`px-3 py-1 rounded border ${page>=pages?'pointer-events-none opacity-40':''}`} href={`/needs?${new URLSearchParams({ ...Object.fromEntries(Object.entries(searchParams).filter(([k])=>!['page'].includes(k))), page:String(page+1), per:String(per) }).toString()}`}>次へ</a>
        </div>
      </div>
    </div>
  );
}
