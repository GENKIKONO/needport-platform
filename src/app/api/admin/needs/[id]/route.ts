export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getNeed } from "@/lib/admin/store";
import { guard } from "../../_util";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const g = guard(req); if (g) return g;
  const need = await getNeed(params.id);
  if (!need) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(need);
}
