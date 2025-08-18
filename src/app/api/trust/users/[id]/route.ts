export const runtime = "nodejs"; export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/app/api/admin/_util";
import { computeTrust, getUser } from "@/lib/trust/store";

export async function GET(req: NextRequest, { params }: { params:{ id:string } }) {
  const g = guard(req); if (g) return g;
  const user = await getUser(params.id);
  if (!user) return NextResponse.json({ error:"not_found" }, { status:404 });
  const score = await computeTrust(params.id);
  return NextResponse.json({ user, score });
}
