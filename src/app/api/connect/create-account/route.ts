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
    let returnUrl = '/vendor/connect';
    if (ct.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      if (body?.returnUrl) returnUrl = body.returnUrl;
    } else {
      const form = await req.formData().catch(() => null);
      if (form?.get('returnUrl')) returnUrl = String(form.get('returnUrl'));
    }

    // 1) Create Express account (if you already store accountId per vendor, skip creation)
    const account = await stripe.accounts.create({
      type: 'express',
      capabilities: { transfers: { requested: true } },
      business_type: 'individual', // 後でダッシュボードで変更可
    });

    // 2) Onboarding link
    const link = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.PLATFORM_ORIGIN}/vendor/onboarding/refresh`,
      return_url: returnUrl || `${process.env.PLATFORM_ORIGIN}/vendor/onboarding/done`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ accountId: account.id, url: link.url });
  } catch (e: any) {
    console.error('connect/create-account', e);
    return NextResponse.json({ error: 'connect_create_failed', detail: e.message }, { status: 500 });
  }
}
