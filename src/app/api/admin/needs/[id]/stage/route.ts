export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { updateStage, logEvent } from "@/lib/admin/store";
import { guard } from "@/app/api/admin/_util";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const g = guard(req); if (g) return g;
  
  try {
    const { stage } = await req.json();
    const updated = await updateStage(params.id, stage);
    
    if (!updated) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    // イベントログは updateStage 内で自動的に記録される
    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.message.includes('Invalid stage transition')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
