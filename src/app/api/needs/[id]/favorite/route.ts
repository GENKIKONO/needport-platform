import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { toggleFavorite, getNeed } from "@/lib/admin/store";
import { rateLimit } from "@/app/api/_util/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  // レート制限チェック
  const allowed = await rateLimit(req as any, { maxRequests: 60, windowMs: 60000, keyPrefix: "needs_favorite" });
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const uid = cookies().get("uid")?.value;
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const need = await getNeed(params.id);
  if (!need || need.deletedAt || !need.isPublished) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { on } = await req.json().catch(() => ({ on: true }));
  const ok = await toggleFavorite(params.id, uid, !!on);
  return NextResponse.json({ ok });
}
