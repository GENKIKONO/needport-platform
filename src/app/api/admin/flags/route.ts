import { NextRequest, NextResponse } from "next/server";
import { getFlags, setFlags } from "@/lib/admin/flags";
import { guard } from "@/app/api/admin/_util";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const g = guard(req); if (g) return g;
  return NextResponse.json(await getFlags());
}

export async function PUT(req: NextRequest) {
  const g = guard(req); if (g) return g;
  const patch = await req.json();
  return NextResponse.json(await setFlags(patch));
}
