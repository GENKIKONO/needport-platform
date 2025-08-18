import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { listNeedsByOwner } from "@/lib/admin/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const uid = cookies().get("uid")?.value;
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  
  const items = await listNeedsByOwner(uid);
  return NextResponse.json({ items });
}
