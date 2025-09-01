import { canonical, title as ttl, desc as dsc } from "@/lib/seo/meta";

export default async function Head({ params }: { params: { id: string } }) {
  // 既存 list API を単品取得に利用（公開情報のみ）
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_ORIGIN || ""}/api/needs/list?id=${encodeURIComponent(params.id)}&per=1`, { next: { revalidate: 60 } }).catch(()=>null);
  const json = await res?.json().catch(()=>null);
  const n = json?.rows?.[0] || {};
  const t = n?.title ? `${n.title} | NeedPort` : ttl("ニーズ詳細");
  const d = n?.summary ? String(n.summary).slice(0, 120) : dsc();
  const c = canonical(`/v2/needs/${params.id}`);
  return (
    <>
      <title>{t}</title>
      <meta name="description" content={d}/>
      <link rel="canonical" href={c}/>
      <meta property="og:title" content={t}/>
      <meta property="og:description" content={d}/>
      <meta property="og:type" content="article"/>
      <meta name="twitter:card" content="summary_large_image"/>
    </>
  );
}
