import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    // Stripe環境変数チェック
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'stripe_not_configured' }, { status: 503 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
    const { accountId, returnUrl } = await req.json();
    
    if (!accountId) return NextResponse.json({ error: 'accountId_required' }, { status: 400 });

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.PLATFORM_ORIGIN}/vendor/onboarding/refresh`,
      return_url: returnUrl || `${process.env.PLATFORM_ORIGIN}/vendor/onboarding/done`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: link.url });
  } catch (e: any) {
    console.error('connect/account-link', e);
    return NextResponse.json({ error: 'account_link_failed', detail: e.message }, { status: 500 });
  }
}
