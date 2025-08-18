import Link from "next/link"
import { SupportMeter } from "./SupportMeter"
import type { NeedRow } from "@/lib/admin/types"

export function NeedCard({ need }: { need: NeedRow }) {
  return (
    <Link href={`/needs/${need.id}`} className="block group rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition">
      <h3 className="text-base font-semibold truncate group-hover:text-primary-700">{need.title}</h3>
      <p className="text-sm text-slate-600 line-clamp-2 mt-1">{need.body}</p>
      <div className="mt-4">
        <SupportMeter current={need.supportsCount ?? 0} goal={10} />
      </div>
      <div className="mt-3 text-primary-600 font-medium">詳細を見る →</div>
    </Link>
  )
}
