import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";
import { insertAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "missing_webhook_secret" }, { status: 500 });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "missing_signature" }, { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err:any) {
    console.error("[stripe:webhook:verify_failed]", err?.message || err);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  try {
    // まず去重：同じevent.idを二重処理しない
    try {
      const sadmin = (await import("@/lib/supabase-server")).supabaseAdmin();
      const { error: dedupeErr } = await sadmin.from("webhook_events").insert({ id: event.id });
      if (dedupeErr) {
        // 既に処理済み
        return NextResponse.json({ ok: true });
      }
    } catch (e) {
      console.error("[stripe:webhook:dedupe_fail]", e);
    }

    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;
      await insertAudit({
        actorType: "system",
        action: "stripe.checkout.session.completed",
        targetType: "checkout_session",
        targetId: s.id,
        meta: { kind: s.metadata?.kind, needId: s.metadata?.needId, customer: s.customer, subscription: s.subscription }
      });
      // DB フラグ更新（スキーマに合わせて調整）
      // 例：
      //  - kind === 'payment'      → vendor_accesses に insert（needId + customerId ひも付け）
      //  - kind === 'subscription' → user_phone_supports に upsert（customerId ひも付け）
      try {
        const sadmin = (await import("@/lib/supabase-server")).supabaseAdmin();
        const customerId = typeof s.customer === "string" ? s.customer : null;
        const kind = s.metadata?.kind ?? "payment";
        const needId = s.metadata?.needId || null;
        const clerkUserId = s.metadata?.clerkUserId || null;

        if (clerkUserId && customerId) {
          await sadmin.from("user_identities").upsert({
            clerk_user_id: clerkUserId,
            stripe_customer_id: customerId
          }, { onConflict: "clerk_user_id" });
        }

        if (kind === "payment" && needId && customerId) {
          await sadmin.from("vendor_accesses").insert({
            need_id: needId,
            stripe_customer_id: customerId,
            unlocked_at: new Date().toISOString()
          });
        }
        if (kind === "subscription" && customerId) {
          await sadmin.from("user_phone_supports").upsert({
            stripe_customer_id: customerId,
            active: true,
            updated_at: new Date().toISOString()
          }, { onConflict: "stripe_customer_id" });
        }
      } catch (e) {
        console.error("[stripe:webhook:db_update_failed]", e);
      }
    }
    if (event.type.startsWith("customer.subscription.")) {
      const sub = event.data.object as Stripe.Subscription;
      await insertAudit({
        actorType: "system",
        action: `stripe.${event.type}`,
        targetType: "subscription",
        targetId: sub.id,
        meta: { status: sub.status, customer: sub.customer }
      });
      // サブスク状態に応じてON/OFF
      try {
        const sadmin = (await import("@/lib/supabase-server")).supabaseAdmin();
        const customerId = typeof sub.customer === "string" ? sub.customer : null;
        if (customerId) {
          const active = sub.status === "active" || sub.status === "trialing";
          await sadmin.from("user_phone_supports").upsert({
            stripe_customer_id: customerId,
            active,
            updated_at: new Date().toISOString()
          }, { onConflict: "stripe_customer_id" });
        }
      } catch (e) {
        console.error("[stripe:webhook:sub_update_failed]", e);
      }
    }
  } catch (err:any) {
    console.error("[stripe:webhook:handler_error]", err?.message || err);
    return NextResponse.json({ error: "handler_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

export const config = { api: { bodyParser: false } } as any;
