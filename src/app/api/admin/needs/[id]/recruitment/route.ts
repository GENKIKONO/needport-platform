import { NextResponse } from "next/server";
import { createAdminClientOrNull } from "@/lib/supabase/admin";


// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ ok: false, error: "Need ID required" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { closed } = body;

    if (typeof closed !== "boolean") {
      return NextResponse.json({ 
        ok: false, 
        error: "closed must be a boolean" 
      }, { status: 400 });
    }

    const admin = createAdminClientOrNull();
    
    if (!admin) {
      return NextResponse.json(
        { error: 'SERVICE_UNAVAILABLE', detail: 'Admin env not configured' },
        { status: 503 }
      );
    }
    const { error } = await admin
      .from("needs")
      .update({
        recruitment_closed: closed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ 
      ok: false, 
      error: e?.message ?? "Unknown error" 
    }, { status: 500 });
  }
}
