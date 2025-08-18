import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { restoreNeed, getNeed } from "@/lib/admin/store";
import { rateLimit } from "@/app/api/_util/ratelimit";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // レート制限チェック
  const allowed = await rateLimit(req, { maxRequests: 10, windowMs: 60000, keyPrefix: "me_restore" });
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const uid = cookies().get("uid")?.value;
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const need = await getNeed(params.id);
  if (!need) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (need.ownerUserId !== uid) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const ok = await restoreNeed(params.id);
  if (!ok) return NextResponse.json({ error: "restore_failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
