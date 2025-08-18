import { NextResponse } from "next/server";
import { getFlags } from "@/lib/admin/flags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const flags = await getFlags();
    return NextResponse.json(flags);
  } catch (error) {
    console.error("Failed to get flags:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
