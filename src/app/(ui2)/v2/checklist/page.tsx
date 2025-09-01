"use client";
import useSWR from "swr";
import Link from "next/link";

const fetcher = async (url:string) => {
  const r = await fetch(url);
  if(!r.ok) throw new Error(`fetch failed: ${r.status}`);
  return r.json();
};

function Item({ok,label,href}:{ok:boolean|undefined,label:string,href?:string}) {
  return (
    <li className="flex items-start gap-2">
      <span className={`mt-0.5 inline-block h-2.5 w-2.5 rounded-full ${ok===undefined?"bg-slate-300":ok?"bg-emerald-500":"bg-red-500"}`} />
      <span className="text-sm text-slate-800">
        {label} {href && (<Link href={href} className="text-sky-700 underline ml-2">開く</Link>)}
      </span>
    </li>
  );
}

export default function Page(){
  const { data: ready } = useSWR("/api/ready", fetcher);
  const { data: needs } = useSWR("/api/needs/list?per=1", fetcher);
  const { data: vendors } = useSWR("/api/vendors", fetcher);

  const okReady = !!ready;
  const okNeeds = needs && Array.isArray(needs.rows);
  const okVendors = vendors && Array.isArray(vendors.rows);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-semibold">Level-2 仕上げチェック（人間の最終確認）</h1>
      <section className="border rounded p-4 bg-white">
        <h2 className="font-medium mb-2">基本</h2>
        <ul className="space-y-2">
          <Item ok={true} label="/v2 ホームのコピー・導線" href="/v2" />
          <Item ok={okNeeds} label="/v2/needs 一覧（スケルトン/エラー表示）" href="/v2/needs" />
          <Item ok={true} label="/v2/needs/[id] 5W1H/フロー/関連/CTA" />
          <Item ok={okVendors} label="/v2/vendors 検索/カテゴリ" href="/v2/vendors" />
          <Item ok={okReady} label="/api/ready の seo/analytics/notify メタ" href="/api/ready" />
        </ul>
      </section>
      <section className="border rounded p-4 bg-white">
        <h2 className="font-medium mb-2">チャット紐付け（要手動検証）</h2>
        <ol className="list-decimal pl-6 text-sm space-y-1">
          <li>ユーザAでニーズ→提案A→チャットA作成。ユーザBで提案B→チャットB作成。</li>
          <li>ユーザBがチャットAのメッセージを閲覧できないこと（RLS）。</li>
          <li>承認前メッセージは相手に表示されない（visible=false）。承認後に表示。</li>
          <li>既読更新が他スレッドに影響しない（/api/messages/read）。</li>
        </ol>
      </section>
      <p className="text-xs text-slate-500">詳細版は docs/LEVEL2_CHECKLIST.md を参照してください。</p>
    </div>
  );
}
