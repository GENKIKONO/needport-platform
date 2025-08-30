import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export async function POST(req: NextRequest) {
  try {
    const { mode } = await req.json(); // 'payment' | 'subscription'
    const price = mode === 'subscription'
      ? process.env.PRICE_PHONE_SUPPORT
      : process.env.PRICE_FLAT_UNLOCK;

    if (!price) return NextResponse.json({ error: 'price_not_configured' }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
      mode: mode === 'subscription' ? 'subscription' : 'payment',
      line_items: [{ price, quantity: 1 }],
      success_url: `${process.env.PLATFORM_ORIGIN}/billing/success?sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.PLATFORM_ORIGIN}/billing/cancelled`,
      // Connect（将来マーケットプレイス化）を見据えてメタデータを保持
      metadata: { kind: mode },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error('[checkout:create_error]', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
