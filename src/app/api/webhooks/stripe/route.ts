import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { paymentManager } from "@/lib/payments/core";
import { headers } from "next/headers";

/**
 * Stripe Webhook Handler (Lv1: Integrity check only)
 * 
 * Lv1 Policy: No automatic refund/release processing
 * - Only logs events and verifies integrity
 * - Manual operator approval required for all actions
 * 
 * Lv2+ Policy: Full automation planned (do not remove event handlers)
 */

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
            deposit_amount,
            estimate_price
          } = session.metadata;

          // Create payment record in new system
          const paymentResult = await paymentManager.createPaymentRecord({
            type: 'deposit',
            amount: parseInt(deposit_amount),
            vendor_id,
            proposal_id,
            need_id,
            stripe_payment_intent_id: session.payment_intent as string,
            stripe_session_id: session.id,
            metadata: {
              original_estimate: parseInt(estimate_price || '0'),
              deposit_percentage: 10
            }
          });

          if (paymentResult.success) {
            // Update payment record to completed
            await paymentManager.updatePaymentStatus(
              paymentResult.payment_record_id!,
              'completed',
              {
                completed_at: new Date().toISOString(),
                stripe_charge_id: session.payment_intent
              }
            );
          }

          // Create vendor access record (existing logic)
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
          }

          // Update proposal status to indicate payment received
          await sadmin
            .from("proposals")
            .update({ 
              status: "deposit_paid",
              updated_at: new Date().toISOString()
            })
            .eq("id", proposal_id);

          // Enhanced audit log
          await sadmin.from("audit_logs").insert({
            actor_id: vendor_id,
            action: "PII_UNLOCKED",
            target_type: "need",
            target_id: need_id,
            meta: {
              proposal_id,
              session_id: session.id,
              payment_intent_id: session.payment_intent,
              deposit_amount: parseInt(deposit_amount),
              payment_record_id: paymentResult.payment_record_id,
              estimate_price: parseInt(estimate_price || '0')
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

      case "charge.dispute.created": {
        // 支払い異議申し立て
        const dispute = event.data.object;
        
        await sadmin.from("audit_logs").insert({
          actor_id: 'system',
          action: "DISPUTE_CREATED",
          target_type: "charge",
          target_id: dispute.charge,
          meta: {
            dispute_id: dispute.id,
            amount: dispute.amount,
            reason: dispute.reason,
            status: dispute.status
          }
        });
        break;
      }

      case "payment_intent.payment_failed": {
        // 決済失敗
        const paymentIntent = event.data.object;
        
        // 決済記録を失敗状態に更新
        const { data: paymentRecord } = await sadmin
          .from('payment_records')
          .select('id')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single();

        if (paymentRecord) {
          await paymentManager.updatePaymentStatus(
            paymentRecord.id,
            'failed',
            {
              failure_reason: paymentIntent.last_payment_error?.message,
              failed_at: new Date().toISOString()
            }
          );
        }

        await sadmin.from("audit_logs").insert({
          actor_id: 'system',
          action: "PAYMENT_FAILED",
          target_type: "payment_intent",
          target_id: paymentIntent.id,
          meta: {
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            failure_code: paymentIntent.last_payment_error?.code,
            failure_message: paymentIntent.last_payment_error?.message
          }
        });
        break;
      }

      case "refund.created": {
        // 返金作成（Stripe側で処理された）
        const refund = event.data.object;
        
        await sadmin.from("audit_logs").insert({
          actor_id: 'system',
          action: "REFUND_CREATED",
          target_type: "refund",
          target_id: refund.id,
          meta: {
            amount: refund.amount,
            currency: refund.currency,
            status: refund.status,
            payment_intent: refund.payment_intent,
            reason: refund.reason
          }
        });
        break;
      }

      case "refund.updated": {
        // 返金ステータス更新
        const refund = event.data.object;
        
        // 返金リクエストのステータスを更新
        if (refund.metadata?.refund_request_id) {
          const status = refund.status === 'succeeded' ? 'completed' : 
                        refund.status === 'failed' ? 'failed' : 'processing';
          
          await sadmin
            .from('refund_requests')
            .update({
              status,
              processed_at: refund.status === 'succeeded' ? new Date().toISOString() : null,
              updated_at: new Date().toISOString()
            })
            .eq('id', refund.metadata.refund_request_id);
        }

        await sadmin.from("audit_logs").insert({
          actor_id: 'system',
          action: "REFUND_UPDATED",
          target_type: "refund",
          target_id: refund.id,
          meta: {
            status: refund.status,
            amount: refund.amount,
            payment_intent: refund.payment_intent,
            refund_request_id: refund.metadata?.refund_request_id
          }
        });
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