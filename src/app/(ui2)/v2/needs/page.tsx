import { normalize } from "@/app/(ui2)/_lib/paging";
import { headers } from "next/headers";

export const metadata = { title: "ニーズ一覧 – NeedPort" };
// 一覧は頻繁に更新されるため動的レンダリング
export const dynamic = "force-dynamic";

export default async function NeedsIndex({ searchParams }: { searchParams?: any }) {
  const { page, size, q, area, cat } = normalize(searchParams ?? {});
  return <div className="space-y-4">
    <h1 className="text-xl font-bold">ニーズ一覧</h1>
    <div className="hidden md:block card p-0 overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr><th className="text-left p-3">タイトル</th><th className="text-left p-3">カテゴリ</th><th className="text-left p-3">地域</th><th className="p-3">更新日</th><th className="p-3">提案</th></tr>
        </thead>
        <tbody id="np-needs-table"><tr><td className="p-3" colSpan={5}>データ読込…</td></tr></tbody>
      </table>
    </div>
    <div className="grid md:hidden gap-3" id="np-needs-cards">
      <div className="card p-3">カード表示（API接続済みなら差し替え）</div>
    </div>
  </div>;
}
