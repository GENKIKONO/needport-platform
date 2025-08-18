export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { updateStage } from "@/lib/admin/store";
import { guard } from "../../../_util";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const g = guard(req); if (g) return g;
  const { stage } = await req.json();
  
  try {
    const updated = await updateStage(params.id, stage);
    if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
    
    console.log('Admin stage update success:', { id: params.id, stage, timestamp: new Date().toISOString() });
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Admin stage update failed:', { id: params.id, stage, error: error.message });
    if (error.message.includes('Invalid stage transition')) {
      return NextResponse.json({ error: "invalid_transition", message: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}
