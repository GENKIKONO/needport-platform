import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // Stripe環境変数チェック
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'stripe_not_configured' }, { status: 503 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
    const ct = req.headers.get('content-type') || '';
    let accountId = ''; let returnUrl = '/vendor/connect';
    if (ct.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      accountId = body?.accountId || '';
      returnUrl = body?.returnUrl || returnUrl;
    } else {
      const form = await req.formData().catch(() => null);
      accountId = String(form?.get('accountId') || '');
      returnUrl = String(form?.get('returnUrl') || returnUrl);
    }
    
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
