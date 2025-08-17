export const dynamic="force-dynamic"; 
export const revalidate=0;
import Link from "next/link";
import { getNeedByIdSafe } from "@/lib/demo/data";
import NeedInterestMeter from "@/components/NeedInterestMeter";
import OffersList from "@/components/OffersList";

export default async function NeedDetail({params}:{params:{id:string}}){
  const need = await getNeedByIdSafe(params.id);
  if(!need){ // 赤エラー回避：静かな404
    return (
      <main className="section">
        <div className="np-card p-6 text-center">
          <h1 className="text-xl font-bold text-gray-900">ニーズが見つかりませんでした</h1>
          <p className="mt-2 text-sm text-gray-600">URLを確認するか、一覧から探してみてください。</p>
          <div className="mt-4 flex gap-2 justify-center">
            <Link className="btn btn-primary" href="/needs">一覧へ</Link>
            <Link className="btn btn-ghost" href="/">ホームへ</Link>
          </div>
        </div>
      </main>
    );
  }
  
  // Mock interest data
  const interestData = {
    buyCount: Math.floor(need.count * 0.4),
    maybeCount: Math.floor(need.count * 0.3),
    interestCount: Math.floor(need.count * 0.3),
    totalCount: need.count
  };
  
  return (
    <main className="section space-y-6">
      <div className="np-card p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{need.title}</h1>
        
        {/* Interest Meter */}
        <div className="mb-6">
          <NeedInterestMeter {...interestData} />
        </div>
        
        <p className="text-gray-700 leading-7 mb-6">{need.description}</p>
        
        {/* Meta info */}
        <div className="flex items-center gap-2 mb-6">
          <span className="np-badge bg-blue-100 text-blue-800">{need.category}</span>
          <span className="np-badge bg-gray-100 text-gray-600">{need.area}</span>
        </div>
        
        <div className="flex gap-2">
          <Link href="/post" className="btn btn-primary h-11 text-base">
            賛同して参加する
          </Link>
          <Link href="/needs" className="btn btn-ghost h-11 text-base">
            一覧へ
          </Link>
        </div>
      </div>

      {/* 提案する（企業向け） */}
      <section className="section">
        <div className="np-card p-5">
          <h2 className="text-lg font-semibold mb-3">このニーズに提案する</h2>
          <form action={async (formData:FormData) => {
            'use server';
            const needId = params.id;
            await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/offers`, {
              method:'POST', headers:{'Content-Type':'application/json'},
              body: JSON.stringify({
                need_id: needId,
                price_yen: Number(formData.get('price')||0)||null,
                memo: String(formData.get('memo')||''),
              }),
            });
          }}>
            <div className="grid sm:grid-cols-2 gap-3">
              <input name="price" type="number" placeholder="提案金額(円)" className="input input-bordered" />
              <input name="memo" placeholder="提案メモ（任意）" className="input input-bordered" />
            </div>
            <button className="btn btn-primary mt-3">提案を送る</button>
          </form>
        </div>

        {/* 提案一覧 */}
        <OffersList needId={params.id} />
      </section>
    </main>
  );
}
