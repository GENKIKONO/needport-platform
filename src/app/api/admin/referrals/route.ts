import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/app/api/admin/_util";
import { listReferralInvitesByNeed } from "@/lib/trust/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const g = guard(req); if (g) return g;
  const { searchParams } = new URL(req.url);
  const needId = searchParams.get("needId");
  if (!needId) return NextResponse.json({ error: "needId required" }, { status: 400 });
  const items = await listReferralInvitesByNeed(needId, 5);
  return NextResponse.json({ items });
}
