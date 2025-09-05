import Link from "next/link";

async function getIndustries() {
  const url = `${process.env.PLATFORM_ORIGIN ?? ""}/api/industries`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();
    return json?.rows ?? [];
  } catch { return []; }
}

async function getVendors(slug?: string | null) {
  const qs = slug ? `?slug=${encodeURIComponent(slug)}` : "";
  const url = `${process.env.PLATFORM_ORIGIN ?? ""}/api/vendors${qs}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();
    return json?.rows ?? [];
  } catch { return []; }
}

export default async function VendorsV2({ searchParams }: { searchParams: { slug?: string } }) {
  const [inds, vendors] = await Promise.all([
    getIndustries(),
    getVendors(searchParams?.slug),
  ]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">事業者リスト</h1>
        <p className="mt-2 text-slate-600 text-sm">
          カテゴリごとに事業者を探せます。<span className="font-medium">成果報酬対象外のカテゴリ</span>は「顔出し登録＋月額サブスク」で参加。通常カテゴリは匿名から開始します。
        </p>
      </header>

      <div className="flex flex-wrap gap-2 mb-5">
        <Link href="/vendors" className={`px-3 py-1.5 rounded border ${!searchParams?.slug ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:bg-slate-50"}`}>すべて</Link>
        {inds.map((i:any)=>(
          <Link key={i.id} href={`/v2/vendors?slug=${i.slug}`} className={`px-3 py-1.5 rounded border ${searchParams?.slug===i.slug ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:bg-slate-50"}`}>
            {i.name}{i.fee_applicable ? "" : "（成果報酬対象外）"}
          </Link>
        ))}
      </div>

      {vendors.length === 0 ? (
        <div className="text-slate-600">該当する事業者がまだいません。</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {vendors.map((v:any)=>(
            <div key={v.user_id} className="p-4 border rounded bg-white">
              <div className="font-medium text-slate-900">{v.name ?? "Vendor#????"}</div>
              {Array.isArray(v.industries) && v.industries.length>0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {v.industries.map((n:string, idx:number)=>(
                    <span key={idx} className="px-2 py-0.5 text-xs rounded bg-slate-100 border">{n}</span>
                  ))}
                </div>
              )}
              {v.any_fee_blocked && (
                <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                  成果報酬対象外のカテゴリを含みます（顔出し＋月額）
                </div>
              )}
              <div className="mt-3">
                <Link href={`/vendors/${v.user_id}`} className="text-sky-700 underline text-sm">プロフィールを見る</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
