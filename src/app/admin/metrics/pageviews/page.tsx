export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getPageviewsSafe } from "@/lib/server/metrics"; // 新規ユーティリティ（次パッチ）
import Link from "next/link";

export default async function PageviewsPage() {
  const { ok, data, error } = await getPageviewsSafe();

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">ページビュー（実験）</h1>
        <Link href="/admin" className="text-sm underline">Adminへ戻る</Link>
      </div>

      {!ok ? (
        <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm">
          <p className="font-medium">ページビューは未設定です。</p>
          <p className="opacity-80 mt-1">
            Supabase に <code>public.pageviews</code> テーブルが無いか、権限がありません。
            未設定でもサイト動作には影響しません。
          </p>
          {process.env.NODE_ENV !== "production" && error ? (
            <pre className="mt-2 max-h-40 overflow-auto opacity-70 text-xs">{error}</pre>
          ) : null}
        </div>
      ) : (
        <div className="rounded-md border border-slate-700/40 p-4">
          <div className="text-sm opacity-70">最新10件</div>
          <ul className="mt-2 space-y-1 text-sm">
            {data!.map((r, i) => (
              <li key={i}>
                <span className="opacity-70">{r.path}</span>
                <span className="ml-2">— {r.pv} PV</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
