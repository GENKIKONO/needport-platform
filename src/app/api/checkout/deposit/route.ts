import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe/client";
import { supabaseAdmin } from "@/lib/supabase/admin";

const schema = z.object({
  proposalId: z.string().uuid(),
  returnUrl: z.string().url().optional()
});

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (!stripe) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", issues: parsed.error.issues }, { status: 400 });
  }

  const { proposalId, returnUrl } = parsed.data;
  const sadmin = supabaseAdmin();

  // Get proposal with need info
  const { data: proposal, error: proposalError } = await sadmin
    .from("proposals")
    .select(`
      id,
      vendor_id,
      estimate_price,
      status,
      needs:need_id (
        id,
        title,
        status
      )
    `)
    .eq("id", proposalId)
    .single();

  if (proposalError || !proposal) {
    return NextResponse.json({ error: "proposal_not_found" }, { status: 404 });
  }

  // Check if user is the vendor who made this proposal
  if (proposal.vendor_id !== userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Check if need is still active
  if (!proposal.needs || proposal.needs.status !== "published") {
    return NextResponse.json({ error: "need_not_active" }, { status: 400 });
  }

  // Calculate 10% deposit amount
  const estimatePrice = proposal.estimate_price || 100000; // Default 100,000 yen if no estimate
  const depositAmount = Math.round(estimatePrice * 0.1);

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
            name: `ニーズ情報解放デポジット - ${proposal.needs.title}`,
            description: `提案による情報解放のための前払い金（見積額の10%）`
          },
          unit_amount: depositAmount
        },
        quantity: 1
      }],
      mode: "payment",
      success_url: returnUrl || `${baseUrl}/proposals/${proposalId}/success`,
      cancel_url: returnUrl || `${baseUrl}/proposals/${proposalId}`,
      metadata: {
        type: "pii_unlock_deposit",
        proposal_id: proposalId,
        vendor_id: userId,
        need_id: proposal.needs.id,
        estimate_price: estimatePrice.toString(),
        deposit_amount: depositAmount.toString()
      }
    });

    // Record the payment intent
    await sadmin.from("audit_logs").insert({
      actor_id: userId,
      action: "DEPOSIT_CHECKOUT_CREATED",
      target_type: "proposal",
      target_id: proposalId,
      meta: {
        session_id: session.id,
        deposit_amount: depositAmount,
        estimate_price: estimatePrice
      }
    });

    return NextResponse.json({ 
      checkoutUrl: session.url,
      sessionId: session.id,
      depositAmount 
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ error: "checkout_creation_failed" }, { status: 500 });
  }
}