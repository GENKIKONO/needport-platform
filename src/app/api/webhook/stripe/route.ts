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
    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;
      await insertAudit({
        actorType: "system",
        action: "stripe.checkout.session.completed",
        targetType: "checkout_session",
        targetId: s.id,
        meta: { kind: s.metadata?.kind, needId: s.metadata?.needId, customer: s.customer, subscription: s.subscription }
      });
      // TODO: kindに応じてDBへ「閲覧解放/サブスクON」の実フラグ更新（後続でRLSに合わせて実装）
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
      // TODO: サブスクの状態に応じてフラグON/OFF更新
    }
  } catch (err:any) {
    console.error("[stripe:webhook:handler_error]", err?.message || err);
    return NextResponse.json({ error: "handler_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

export const config = { api: { bodyParser: false } } as any;
