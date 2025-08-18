import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/app/api/admin/_util";
import { listNeeds, getNeedViews } from "@/lib/admin/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const g = guard(req); if (g) return g;
  
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? undefined;
  const stage = url.searchParams.get("stage") as any ?? undefined;
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "20");

  const { rows, total } = await listNeeds({ q, stage, page, pageSize });

  // 閲覧数を追加（最大50件まで同期取得）
  const rowsWithViews = await Promise.all(
    rows.slice(0, 50).map(async (row) => {
      const views = await getNeedViews(row.id);
      return { ...row, views };
    })
  );

  return NextResponse.json({ rows: rowsWithViews, total });
}
