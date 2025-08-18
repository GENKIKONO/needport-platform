import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/app/api/admin/_util";
import { listReferralInvites } from "@/lib/trust/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const g = guard(req); if (g) return g;
  const { searchParams } = new URL(req.url);
  const needId = searchParams.get("needId") ?? undefined;
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? "5"), 1), 50);
  const data = await listReferralInvites({ needId, limit });
  return NextResponse.json({ items: data.items });
}
