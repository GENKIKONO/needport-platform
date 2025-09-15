import { NextResponse } from "next/server";
import { createAdminClientOrNull } from "@/lib/supabase/admin";


// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

    const body = await _req.json().catch(() => ({}));
    const { minPeople, deadline } = body;

    // Validation
    if (minPeople !== undefined && minPeople !== null) {
      if (!Number.isInteger(minPeople) || minPeople <= 0) {
        return NextResponse.json({ 
          ok: false, 
          error: "minPeople must be a positive integer" 
        }, { status: 400 });
      }
    }

    if (deadline !== undefined && deadline !== null) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(deadline)) {
        return NextResponse.json({ 
          ok: false, 
          error: "deadline must be in YYYY-MM-DD format" 
        }, { status: 400 });
      }
      
      const date = new Date(deadline);
      if (isNaN(date.getTime())) {
        return NextResponse.json({ 
          ok: false, 
          error: "deadline must be a valid date" 
        }, { status: 400 });
      }
    }

    const admin = createAdminClientOrNull();
    
    if (!admin) {
      return NextResponse.json(
        { error: 'SERVICE_UNAVAILABLE', detail: 'Admin env not configured' },
        { status: 503 }
      );
    }
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (minPeople !== undefined) payload.min_people = minPeople;
    if (deadline !== undefined) payload.deadline = deadline;

    const { error } = await admin
      .from("needs")
      .update(payload)
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
