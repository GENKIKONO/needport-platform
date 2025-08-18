import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { addSupport, removeSupport, getNeed } from "@/lib/admin/store";
import { rateLimit } from "@/app/api/_util/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  // レート制限チェック
  const allowed = await rateLimit(_ as any, { maxRequests: 30, windowMs: 60000, keyPrefix: "needs_support" });
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const uid = cookies().get("uid")?.value;
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const need = await getNeed(params.id);
  if (!need || need.deletedAt || !need.isPublished) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const count = await addSupport(params.id, uid);
  return NextResponse.json({ ok: true, supportsCount: count });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  // レート制限チェック
  const allowed = await rateLimit(_ as any, { maxRequests: 30, windowMs: 60000, keyPrefix: "needs_support" });
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const uid = cookies().get("uid")?.value;
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const need = await getNeed(params.id);
  if (!need || need.deletedAt || !need.isPublished) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const count = await removeSupport(params.id, uid);
  return NextResponse.json({ ok: true, supportsCount: count });
}
