import HeaderV2 from "../_parts/Header";
import FooterV2 from "../_parts/Footer";
export const dynamic = "force-dynamic";
async function getData() {
  const baseUrl = process.env.PLATFORM_ORIGIN || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/needs/list?per=12&page=1`, { cache:"no-store" }).catch(()=>null);
  if (!res || !res.ok) return { rows: [], total: 0 };
  return res.json();
}
export default async function NeedsV2(){
  const data = await getData();
  return (
    <>
      <HeaderV2/>
      <main className="max-w-6xl mx-auto px-3 py-6">
        <h2 className="text-xl font-semibold mb-4">ニーズ一覧（v2）</h2>
        {(!data.rows || data.rows.length===0) && <div className="text-slate-500 text-sm">該当するニーズがありません</div>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.rows?.map((n:any)=>(
            <a key={n.id} href={`/needs/${n.id}`} className="block border rounded p-4 hover:shadow-sm">
              <div className="font-medium">{n.title || '（無題）'}</div>
              <div className="text-xs text-slate-500 mt-1">{n.region} / {n.category}</div>
              {n.deadline && <div className="mt-2 text-xs text-amber-700">期限: {new Date(n.deadline).toLocaleDateString()}</div>}
              <p className="mt-2 text-sm text-slate-700 line-clamp-3">{n.summary}</p>
            </a>
          ))}
        </div>
      </main>
      <FooterV2/>
    </>
  );
}
