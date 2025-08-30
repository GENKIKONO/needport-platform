import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { insertAudit } from '@/lib/audit';
// TODO: supabaseAdmin を使って user/vendor の権限付与フラグを更新

export const runtime = 'edge'; // 速度重視。Node 実行にしたい場合は削る

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET!;
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = Stripe.webhooks.constructEvent(body, sig!, secret);
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 代表的イベント
  if (event.type === 'checkout.session.completed') {
    const s = event.data.object as Stripe.Checkout.Session;
    const kind = s.metadata?.kind;
    // kind === 'payment' → 閲覧解放フラグをON
    // kind === 'subscription' → 電話サポサブスク開始フラグをON
    await insertAudit({
      actorType: 'system',
      action: `stripe.${event.type}`,
      targetType: 'checkout_session',
      targetId: s.id,
      meta: { kind, customer: s.customer, subscription: s.subscription },
    });
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    // 電話サポサブスクの停止フラグをON
    await insertAudit({
      actorType: 'system',
      action: `stripe.${event.type}`,
      targetType: 'subscription',
      targetId: sub.id,
      meta: { status: sub.status },
    });
  }

  return NextResponse.json({ received: true });
}
