import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { listFavorites } from "@/lib/admin/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const uid = cookies().get("uid")?.value;
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const items = await listFavorites(uid);
  return NextResponse.json({ items });
}
