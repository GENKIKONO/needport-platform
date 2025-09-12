import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { headers } from "next/headers";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 500 });
  }

  const body = await req.text();
  const headersList = headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "no_signature" }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const sadmin = supabaseAdmin();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        
        // Check if this is a PII unlock deposit
        if (session.metadata?.type === "pii_unlock_deposit") {
          const {
            proposal_id,
            vendor_id,
            need_id,
            deposit_amount
          } = session.metadata;

          // Create vendor access record
          const { error: accessError } = await sadmin
            .from("vendor_accesses")
            .insert({
              need_id,
              vendor_id,
              proposal_id,
              payment_intent_id: session.payment_intent as string,
              deposit_amount: parseInt(deposit_amount),
              session_id: session.id,
              granted_at: new Date().toISOString()
            });

          if (accessError) {
            console.error("Error creating vendor access:", accessError);
            // Don't return error, log for manual recovery
          }

          // Update proposal status to indicate payment received
          await sadmin
            .from("proposals")
            .update({ 
              status: "deposit_paid",
              updated_at: new Date().toISOString()
            })
            .eq("id", proposal_id);

          // Log the successful PII unlock
          await sadmin.from("audit_logs").insert({
            actor_id: vendor_id,
            action: "PII_UNLOCKED",
            target_type: "need",
            target_id: need_id,
            meta: {
              proposal_id,
              session_id: session.id,
              payment_intent_id: session.payment_intent,
              deposit_amount: parseInt(deposit_amount)
            }
          });

          console.log(`PII unlocked for vendor ${vendor_id} on need ${need_id}`);
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        
        if (session.metadata?.type === "pii_unlock_deposit") {
          const { proposal_id, vendor_id } = session.metadata;
          
          // Log expired checkout
          await sadmin.from("audit_logs").insert({
            actor_id: vendor_id,
            action: "DEPOSIT_CHECKOUT_EXPIRED",
            target_type: "proposal",
            target_id: proposal_id,
            meta: {
              session_id: session.id
            }
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "processing_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}