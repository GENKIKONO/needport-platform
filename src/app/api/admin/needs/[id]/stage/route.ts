import { NextRequest, NextResponse } from "next/server";
import { updateStage } from "@/lib/admin/store";
import { guard } from "../../../_util";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const g = guard(req); if (g) return g;
  const { stage } = await req.json();
  const updated = updateStage(params.id, stage);
  if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(updated);
}
