import Link from 'next/link';

async function fetchIndustries() {
  const r = await fetch(`${process.env.PLATFORM_ORIGIN}/api/industries`, { next:{ revalidate: 60 }});
  const j = await r.json();
  return j.rows as {id:string;slug:string;name:string;fee_applicable:boolean}[];
}

async function fetchVendors(slug?:string) {
  const q = slug ? `?slug=${slug}` : '';
  const r = await fetch(`${process.env.PLATFORM_ORIGIN}/api/vendors${q}`, { cache:'no-store' });
  const j = await r.json();
  return j.rows as any[];
}

export default async function VendorsDirectory({ searchParams }: any) {
  const slug = searchParams?.slug as string | undefined;
  const [inds, vendors] = await Promise.all([fetchIndustries(), fetchVendors(slug)]);
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">事業者リスト</h1>

      <div className="flex flex-wrap gap-2">
        <Link href="/vendors" className={`px-3 py-1 rounded border ${!slug?'bg-sky-50 border-sky-300':'border-slate-300'}`}>すべて</Link>
        {inds.map(ind=>(
          <Link key={ind.id} href={`/vendors?slug=${ind.slug}`} className={`px-3 py-1 rounded border ${slug===ind.slug?'bg-sky-50 border-sky-300':'border-slate-300'}`}>
            {ind.name}{ind.fee_applicable? '':'（成果報酬対象外）'}
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendors.map(v=>(
          <div key={v.user_id} className="p-4 border rounded bg-white">
            <div className="flex items-center gap-3">
              {v.avatar_url ? <img className="w-12 h-12 rounded-full" src={v.avatar_url}/> : <div className="w-12 h-12 rounded-full bg-slate-200" />}
              <div>
                <div className="font-medium">{v.name}</div>
                <div className="text-xs text-slate-500">{v.public_areas || '—'}</div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {(v.industries||[]).map((n:string, i:number)=>(
                <span key={i} className="px-2 py-0.5 text-xs rounded bg-slate-100 border">{n}</span>
              ))}
            </div>
            {v.any_fee_blocked && (
              <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                この事業者は成果報酬対象外のカテゴリを含みます
              </div>
            )}
            <div className="mt-3">
              <a className="text-sky-600 hover:underline" href={`/vendors/${v.user_id}`}>プロフィールを見る</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
