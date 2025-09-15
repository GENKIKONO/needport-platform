import { jsonOk, jsonError } from "@/lib/api";
import { createAdminClientOrNull } from "@/lib/supabase/admin";
import { info, error } from "@/lib/logger";
import { OfferCreateSchema } from "@/lib/schemas";
import { logAudit } from "@/lib/audit";
import { enqueueAndMaybeSend } from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

type Body = {
  needId?: string;
  vendorName?: string;
  amount?: number;
};

export async function POST(req: Request) {
  try {
    const supabase = createAdminClientOrNull();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'SERVICE_UNAVAILABLE', detail: 'Admin env not configured' },
        { status: 503 }
      );
    }
    const body = await req.json();

    // Validate input with Zod
    const validation = OfferCreateSchema.safeParse(body);
    if (!validation.success) {
      return jsonError("入力データが無効です", 422, {
        details: validation.error.errors
      });
    }

    const { needId, vendorName, amount } = validation.data;

    info("Creating offer", { endpoint: "POST /api/admin/offers", needId, vendorName, amount });

    // 挿入
    const { data, error } = await supabase
      .from("offers")
      .insert([{ need_id: needId, vendor_name: vendorName, amount }])
      .select("id")
      .single();

    if (error) {
      error("Failed to create offer", { endpoint: "POST /api/admin/offers", error: error.message });
      
      // Unique constraint violation -> duplicate vendor
      if ((error as any).code === "23505") {
        return jsonError("DUPLICATE_VENDOR", 409);
      }
      return jsonError(error.message, 500);
    }

    info("Offer created successfully", { endpoint: "POST /api/admin/offers", offerId: data?.id });
    
    // Log audit
    await logAudit({
      action: "offer.add",
      need_id: needId,
      offer_id: data?.id,
      payload: { vendorName, amount }
    });

    // Enqueue notification
    await enqueueAndMaybeSend('offer.added', needId, data?.id);
    
    return jsonOk({ id: data?.id ?? null });
  } catch (e: any) {
    error("Unexpected error creating offer", { endpoint: "POST /api/admin/offers", error: e?.message });
    return jsonError(e?.message ?? String(e), 500);
  }
}
