import { supabaseAdmin } from '@/lib/supabase/admin';
export const dynamic = 'force-dynamic';

export default async function VendorPublicPage({ params }:{ params:{ id:string }}) {
  // 公開プロフィール
  const { data, error } = await supabaseAdmin()
    .from('vendor_profiles')
    .select('public_name, avatar_url, public_areas, license_no, website')
    .eq('user_id', params.id).maybeSingle();
  if (!data) return <div className="p-6">事業者が見つかりません。</div>;
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="flex items-center gap-4">
        {data.avatar_url ? <img src={data.avatar_url} className="w-14 h-14 rounded-full"/> : <div className="w-14 h-14 rounded-full bg-slate-200"/>}
        <div>
          <h1 className="text-2xl font-semibold">{data.public_name??'事業者'}</h1>
          <div className="text-sm text-muted-foreground">{data.public_areas}</div>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="p-3 border rounded">許可/免許番号：{data.license_no ?? '—'}</div>
        <div className="p-3 border rounded">Webサイト：{data.website ? <a className="link" href={data.website} target="_blank">{data.website}</a> : '—'}</div>
      </div>
      <p className="text-sm text-muted-foreground">※ この事業者はNeedPortの介護タクシーカテゴリで公開登録されています。</p>
    </div>
  );
}
