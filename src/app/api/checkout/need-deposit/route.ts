import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe/client";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Need-based Deposit Checkout API (Lv1: Operator-led refunds only)
 * 
 * Creates Stripe Checkout for 10% deposit of estimated amount for need access
 * Lv1 Policy: Manual refund processing by operators
 */

const schema = z.object({
  needId: z.string(),
  estimateAmount: z.number().min(1000), // Minimum 1000 yen estimate
  returnUrl: z.string().url().optional()
});

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Check if payments are enabled (Lv1 feature flag)
  if (process.env.PAYMENTS_ENABLED !== 'true') {
    return NextResponse.json({ 
      error: "payments_disabled",
      message: "決済機能は現在無効化されています"
    }, { status: 503 });
  }

  if (!stripe) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", issues: parsed.error.issues }, { status: 400 });
  }

  const { needId, estimateAmount, returnUrl } = parsed.data;
  const sadmin = supabaseAdmin();

  // Check if need exists and is active
  const { data: need, error: needError } = await sadmin
    .from("needs")
    .select("id, title, status, user_id")
    .eq("id", needId)
    .single();

  if (needError || !need) {
    return NextResponse.json({ error: "need_not_found" }, { status: 404 });
  }

  if (need.status !== "published") {
    return NextResponse.json({ error: "need_not_active" }, { status: 400 });
  }

  // Check if user is not the need creator
  if (need.user_id === userId) {
    return NextResponse.json({ error: "cannot_unlock_own_need" }, { status: 403 });
  }

  // Calculate 10% deposit amount (Lv1 policy)
  const depositRate = parseFloat(process.env.PLATFORM_FEE_RATE || '0.10');
  const depositAmount = Math.round(estimateAmount * depositRate);

  if (depositAmount < 100) { // Minimum 100 yen
    return NextResponse.json({ error: "deposit_too_small" }, { status: 400 });
  }

  const baseUrl = new URL(req.url).origin;
  
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "jpy",
          product_data: {
            name: `ニーズ情報解放デポジット - ${need.title}`,
            description: `連絡先情報解放のための前払い金（見積額の10%）`
          },
          unit_amount: depositAmount
        },
        quantity: 1
      }],
      mode: "payment",
      success_url: returnUrl || `${baseUrl}/pay/success?needId=${needId}`,
      cancel_url: returnUrl || `${baseUrl}/pay/cancel?needId=${needId}`,
      metadata: {
        type: "need_pii_unlock_deposit",
        need_id: needId,
        vendor_id: userId,
        estimate_amount: estimateAmount.toString(),
        deposit_amount: depositAmount.toString(),
        deposit_rate: depositRate.toString(),
        lv1_policy: "operator_led_refund_only"
      }
    });

    // Record the payment intent
    await sadmin.from("audit_logs").insert({
      actor_id: userId,
      action: "NEED_DEPOSIT_CHECKOUT_CREATED",
      target_type: "need",
      target_id: needId,
      meta: {
        session_id: session.id,
        deposit_amount: depositAmount,
        estimate_amount: estimateAmount
      }
    });

    return NextResponse.json({ 
      checkoutUrl: session.url,
      sessionId: session.id,
      depositAmount 
    });
  } catch (error) {
    console.error("Error creating need deposit checkout session:", error);
    return NextResponse.json({ error: "checkout_creation_failed" }, { status: 500 });
  }
}