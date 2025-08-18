export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { stats } from "@/lib/admin/store";
import { guard } from "../_util";

export async function GET(req: NextRequest) {
  const g = guard(req); if (g) return g;
  return NextResponse.json(await stats());
}
