import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    // Stripeが無効の場合は501を返す
    if (process.env.NEXT_PUBLIC_STRIPE_ENABLED !== '1') {
      console.info({ action: 'stripe-intent', result: 'STRIPE_DISABLED' });
      return NextResponse.json({ error: 'STRIPE_DISABLED' }, { status: 501 });
    }

    const body = await req.json();
    const { amount_yen, room_id } = body || {};
    
    if (!amount_yen || !room_id) {
      return NextResponse.json({ error: 'amount_yen and room_id required' }, { status: 400 });
    }

    // 環境変数が揃っていない場合は501
    if (!process.env.STRIPE_SECRET_KEY) {
      console.info({ action: 'stripe-intent', result: 'STRIPE_NOT_CONFIGURED' });
      return NextResponse.json({ error: 'STRIPE_NOT_CONFIGURED' }, { status: 501 });
    }

    // TODO: 実際のStripe PaymentIntent作成をここに実装
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: amount_yen,
    //   currency: 'jpy',
    //   metadata: { room_id }
    // });

    // 現在はダミー成功レスポンス
    console.info({ action: 'stripe-intent', result: 'SUCCESS', amount_yen, room_id });
    return NextResponse.json({ 
      ok: true, 
      id: 'pi_dummy_' + Date.now(),
      amount: amount_yen,
      currency: 'jpy'
    }, { status: 200 });

  } catch (e) {
    console.error('stripe-intent error:', e);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
