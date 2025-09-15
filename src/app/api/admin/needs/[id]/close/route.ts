import { NextResponse } from "next/server";
import { createAdminClientOrNull } from "@/lib/supabase/admin";
import { jsonOk, jsonError } from "@/lib/api";


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
    const body = await req.json();
    const { closed } = body;

    if (typeof closed !== "boolean") {
      return jsonError("closed must be a boolean");
    }

    const admin = createAdminClientOrNull();
    
    if (!admin) {
      return NextResponse.json(
        { error: 'SERVICE_UNAVAILABLE', detail: 'Admin env not configured' },
        { status: 503 }
      );
    }

    const { data, error } = await admin
      .from("needs")
      .update({ 
        recruitment_closed: closed,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select("id, title, recruitment_closed")
      .single();

    if (error) {
      return jsonError(`Failed to update need: ${error.message}`);
    }

    return jsonOk({ 
      message: `募集を${closed ? "終了" : "再開"}しました`,
      need: data
    });

  } catch (error: any) {
    return jsonError(error?.message ?? "Failed to update recruitment status", 500);
  }
}
