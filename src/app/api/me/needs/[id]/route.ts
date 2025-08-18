import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getFlags } from "@/lib/admin/flags";
import { getNeed, updateNeed, softDeleteNeed } from "@/lib/admin/store";
import { z } from "zod";
import { rateLimit } from "@/app/api/_util/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateNeedSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(2000).optional(),
  estimateYen: z.number().int().min(0).max(10_000_000).optional()
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const uid = req.cookies.get("uid")?.value;
  
  if (!uid) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  
  try {
    const need = await getNeed(params.id);
    if (!need) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    
    if (need.ownerUserId !== uid) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    
    return NextResponse.json(need);
  } catch (error) {
    console.error("Failed to get need:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  // レート制限チェック
  const allowed = await rateLimit(req, { maxRequests: 30, windowMs: 60000, keyPrefix: "me_edit" });
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const uid = cookies().get("uid")?.value;
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const flags = await getFlags();
  if (!flags.userEditEnabled) return NextResponse.json({ error: "locked" }, { status: 423 });

  const need = await getNeed(params.id);
  if (!need || need.ownerUserId !== uid) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const validatedData = updateNeedSchema.parse(body);
    
    const updated = await updateNeed(params.id, validatedData);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "validation_error", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  // レート制限チェック
  const allowed = await rateLimit(req, { maxRequests: 10, windowMs: 60000, keyPrefix: "me_delete" });
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const uid = cookies().get("uid")?.value;
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const flags = await getFlags();
  if (!flags.userDeleteEnabled) return NextResponse.json({ error: "locked" }, { status: 423 });

  const need = await getNeed(params.id);
  if (!need || need.ownerUserId !== uid) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const ok = await softDeleteNeed(params.id);
  return NextResponse.json({ ok });
}
