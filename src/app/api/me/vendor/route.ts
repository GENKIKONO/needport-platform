import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getFlags } from "@/lib/admin/flags";
import { getVendorProfile, upsertVendorProfile } from "@/lib/admin/store";
import { rateLimit } from "@/app/api/_util/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  name: z.string().min(1).max(80).optional(),
  company: z.string().max(120).optional(),
  phone: z.string().max(40).optional(),
  website: z.string().url().max(200).optional(),
  intro: z.string().max(1000).optional(),
});

export async function GET() {
  const uid = cookies().get("uid")?.value;
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const data = await getVendorProfile(uid);
  return NextResponse.json({ vendor: data ?? { id: uid } });
}

export async function PUT(req: Request) {
  // レート制限チェック
  const allowed = await rateLimit(req as any, { maxRequests: 20, windowMs: 60000, keyPrefix: "me_vendor" });
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const uid = cookies().get("uid")?.value;
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const flags = await getFlags();
  if (flags.vendorEditEnabled === false) return NextResponse.json({ error: "locked" }, { status: 423 });

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid", issues: parsed.error.flatten() }, { status: 400 });

  const saved = await upsertVendorProfile(uid, parsed.data);
  return NextResponse.json({ ok: true, vendor: saved });
}
