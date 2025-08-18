export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/app/api/admin/_util";
import { getNeed, updateNeed } from "@/lib/admin/store";

export async function GET(req: NextRequest, { params }: { params: { id: string }}) {
  const g = guard(req); if (g) return g;
  const item = await getNeed(params.id);
  if (!item) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string }}) {
  const g = guard(req); if (g) return g;
  const patch = await req.json().catch(() => ({}));
  const updated = await updateNeed(params.id, {
    title: patch.title,
    body: patch.body,
    estimateYen: patch.estimateYen,
    stage: patch.stage,
    isPublished: patch.isPublished,
    isSample: patch.isSample,
  });
  if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(updated);
}
