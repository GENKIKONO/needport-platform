import { NextResponse } from "next/server";
import { getFlags } from "@/lib/admin/flags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getFlags());
}
