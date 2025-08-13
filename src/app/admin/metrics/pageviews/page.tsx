// ビルド時に絶対実行しない
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs' // edge だと挙動混乱しがちなので nodejs 明示

import { getPageviewsSafe } from '@/lib/server/metrics'

export default async function Page() {
  const res = await getPageviewsSafe()
  if (!res.ok || res.data.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        ページビューは未設定です（テーブル未作成 or 集計無効）。
      </div>
    )
  }
  return (
    <div>
      <h2 className="font-medium mb-2">Pageviews</h2>
      <ul className="list-disc pl-5 text-sm">
        {res.data.map((r) => (
          <li key={r.path}>
            <code>{r.path}</code> : {r.count}
          </li>
        ))}
      </ul>
    </div>
  )
}
