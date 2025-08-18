export const runtime = "nodejs"; export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/app/api/admin/_util";
import { endorseUser } from "@/lib/trust/store";

export async function POST(req: NextRequest) {
  const g = guard(req); if (g) return g;
  const { userId, weight = 1 } = await req.json();
  if (!userId) return NextResponse.json({ error:"userId required" }, { status:400 });
  await endorseUser(userId, Number(weight)||1);
  return NextResponse.json({ ok:true });
}
