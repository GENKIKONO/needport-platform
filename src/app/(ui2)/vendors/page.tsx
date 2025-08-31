import HeaderV2 from "../_parts/Header";
import FooterV2 from "../_parts/Footer";
export const dynamic = "force-dynamic";
async function getData(searchParams: Record<string,string>){
  const baseUrl = process.env.PLATFORM_ORIGIN || "http://localhost:3000";
  const url = new URL(`${baseUrl}/api/vendors`);
  if (searchParams.slug) url.searchParams.set('slug', searchParams.slug);
  const res = await fetch(url.toString(), { cache:"no-store" }).catch(()=>null);
  if (!res || !res.ok) return { rows: [] };
  return res.json();
}
export default async function VendorsV2({ searchParams }:{ searchParams: Record<string,string> }){
  const data = await getData(searchParams);
  return (
    <>
      <HeaderV2/>
      <main className="max-w-6xl mx-auto px-3 py-6">
        <h2 className="text-xl font-semibold mb-4">事業者リスト（v2）</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.rows?.map((v:any)=>(
            <a key={v.user_id} href={`/vendors/${v.user_id}`} className="block border rounded p-4 hover:shadow-sm">
              <div className="font-medium">{v.name}</div>
              {v.public_areas && <div className="text-xs text-slate-500 mt-1">{v.public_areas}</div>}
              <div className="mt-2 flex flex-wrap gap-1">
                {(v.industries||[]).map((n:string,i:number)=>(
                  <span key={i} className="px-2 py-0.5 border rounded text-xs">{n}</span>
                ))}
              </div>
              {v.any_fee_blocked && (
                <div className="mt-2 text-xs text-amber-700 bg-amber-50 border rounded px-2 py-1">
                  成果報酬対象外のカテゴリを含みます
                </div>
              )}
            </a>
          ))}
          {(!data.rows || data.rows.length===0) && <div className="text-slate-500 text-sm">事業者が見つかりません</div>}
        </div>
      </main>
      <FooterV2/>
    </>
  );
}
