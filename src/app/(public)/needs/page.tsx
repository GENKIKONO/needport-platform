import Filters from '@/components/needs/Filters';
import NeedCard from '@/components/needs/Card';

async function fetchNeeds(searchParams: Record<string,string|undefined>) {
  const qs = new URLSearchParams();
  for (const k of ['q','region','cat','sort']) if (searchParams[k]) qs.set(k, String(searchParams[k]));
  const res = await fetch(`${process.env.PLATFORM_ORIGIN}/api/needs/list?`+qs.toString(), { cache: 'no-store', headers: {'x-needport-internal':'1'} });
  if (!res.ok) return [];
  return res.json();
}
export const dynamic = 'force-dynamic';

export default async function NeedsPage({ searchParams }: { searchParams: Record<string,string|undefined> }) {
  const rows = await fetchNeeds(searchParams);
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
    </div>
  );
}
