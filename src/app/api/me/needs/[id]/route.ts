import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getFlags } from "@/lib/admin/flags";
import { getNeed, updateNeed, deleteNeed } from "@/lib/admin/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  const uid = cookies().get("uid")?.value;
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const flags = await getFlags();
  if (!flags.userEditEnabled) return NextResponse.json({ error: "locked" }, { status: 423 });

  const need = await getNeed(params.id);
  if (!need || need.ownerUserId !== uid) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const patch = await req.json(); // title/description/estimateYen 等
  const updated = await updateNeed(params.id, patch);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const uid = cookies().get("uid")?.value;
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const flags = await getFlags();
  if (!flags.userDeleteEnabled) return NextResponse.json({ error: "locked" }, { status: 423 });

  const need = await getNeed(params.id);
  if (!need || need.ownerUserId !== uid) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const ok = await deleteNeed(params.id);
  return NextResponse.json({ ok });
}
