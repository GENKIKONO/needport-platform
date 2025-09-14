import { NextResponse } from "next/server";
import { createAdminClientOrNull } from "@/lib/supabase/admin";
import { guardDestructiveAction } from "@/lib/server/demo-guard";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ offerId: string }> }
) {
  try {
    // Check demo mode
    const demoCheck = guardDestructiveAction();
    if (!demoCheck.allowed) {
      return NextResponse.json({ ok: false, error: demoCheck.message }, { status: 403 });
    }

    const supabase = createAdminClientOrNull();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'SERVICE_UNAVAILABLE', detail: 'Admin env not configured' },
        { status: 503 }
      );
    }
    const { offerId: id } = await params;

    if (!id) {
      return NextResponse.json({ ok: false, error: "offerId is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("offers")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ offerId: string }> }
) {
  try {
    const { offerId } = await params;
    if (!offerId) {
      return NextResponse.json({ ok: false, error: "offerId is required" }, { status: 400 });
    }

    const body = await _req.json().catch(() => ({}));
    const vendorNameRaw = typeof body?.vendorName === "string" ? body.vendorName.trim() : undefined;
    const amountRaw = body?.amount;

    if (!vendorNameRaw && (amountRaw === undefined || amountRaw === null)) {
      return NextResponse.json({ ok: false, error: "Nothing to update" }, { status: 400 });
    }

    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    if (vendorNameRaw) patch.vendor_name = vendorNameRaw;
    if (amountRaw !== undefined && amountRaw !== null) {
      const n = Number(amountRaw);
      if (!Number.isFinite(n) || n <= 0) {
        return NextResponse.json({ ok: false, error: "amount must be a positive number" }, { status: 400 });
      }
      patch.amount = n;
    }

    const supabase = createAdminClientOrNull();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'SERVICE_UNAVAILABLE', detail: 'Admin env not configured' },
        { status: 503 }
      );
    }
    const { error } = await supabase.from("offers").update(patch).eq("id", offerId);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
