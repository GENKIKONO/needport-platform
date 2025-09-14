import { NextResponse } from "next/server";
import { createAdminClientOrNull } from "@/lib/supabase/admin";

// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

  const body = await _req.json().catch(() => ({}));
  const { offerId, minPeople, deadline } = body;

  const admin = createAdminClientOrNull();
    
    if (!admin) {
      return NextResponse.json(
        { error: 'SERVICE_UNAVAILABLE', detail: 'Admin env not configured' },
        { status: 503 }
      );
    }

  // Branch for UNADOPT
  if (offerId === null) {
    const { error } = await admin
      .from("needs")
      .update({
        adopted_offer_id: null,
        min_people: null,
        deadline: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    // Log the unadopt action
    await admin
      .from("adoption_logs")
      .insert({
        need_id: id,
        offer_id: null,
        action: "UNADOPT",
        actor: "admin",
      });

    return NextResponse.json({ ok: true });
  }

  // Branch for ADOPT (offerId provided)
  if (!offerId) return NextResponse.json({ ok: false, error: "offerId required" }, { status: 400 });
  if (minPeople != null && (!Number.isInteger(minPeople) || minPeople <= 0)) {
    return NextResponse.json({ ok: false, error: "minPeople must be positive integer" }, { status: 400 });
  }

  // 該当ニーズに紐づくオファーか確認
  const { data: off, error: e1 } = await admin.from("offers").select("id, need_id").eq("id", offerId).single();
  if (e1) return NextResponse.json({ ok: false, error: e1.message }, { status: 500 });
  if (!off || off.need_id !== id) return NextResponse.json({ ok: false, error: "Offer does not belong to this need" }, { status: 400 });

  // Build update payload
  const payload: Record<string, any> = {
    adopted_offer_id: offerId,
    updated_at: new Date().toISOString(),
  };
  if (Number.isFinite(minPeople)) payload.min_people = minPeople;
  if (deadline) payload.deadline = deadline;

  const { error: e2 } = await admin.from("needs").update(payload).eq("id", id).single();
  if (e2) return NextResponse.json({ ok: false, error: e2.message }, { status: 500 });

  // Log the adopt action
  await admin
    .from("adoption_logs")
    .insert({
      need_id: id,
      offer_id: offerId,
      action: "ADOPT",
      actor: "admin",
    });

  return NextResponse.json({ ok: true });
}
