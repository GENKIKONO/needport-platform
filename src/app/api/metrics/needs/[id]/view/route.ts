import { NextRequest, NextResponse } from "next/server";
import { incrementNeedView } from "@/lib/admin/store";

export const runtime = "edge";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const views = await incrementNeedView(params.id);
    return NextResponse.json({ ok: true, views });
  } catch (error) {
    console.error('Failed to increment view:', error);
    return NextResponse.json({ ok: false, error: 'failed' }, { status: 500 });
  }
}
