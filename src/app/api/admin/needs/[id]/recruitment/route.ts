import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

    const admin = createAdminClient();
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
