export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { updateExpert } from "@/lib/admin/store";
import { guard } from "../../../_util";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const g = guard(req); if (g) return g;
  const { verdict } = await req.json();
  const updated = await updateExpert(params.id, verdict);
  if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(updated);
}
