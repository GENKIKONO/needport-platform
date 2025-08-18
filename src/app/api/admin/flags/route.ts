import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/app/api/admin/_util";
import { getFlags, setFlags } from "@/lib/admin/flags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const g = guard(req); if (g) return g;
  
  try {
    const flags = await getFlags();
    return NextResponse.json(flags);
  } catch (error) {
    console.error("Failed to get flags:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const g = guard(req); if (g) return g;
  
  try {
    const patch = await req.json();
    const flags = await setFlags(patch);
    return NextResponse.json(flags);
  } catch (error) {
    console.error("Failed to set flags:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
