import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getAuth } from '@clerk/nextjs/server';

const bodySchema = z.object({
  settlementId: z.string().uuid(),
  method: z.enum(['stripe','bank_transfer']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export async function POST(req: Request) {
  const { userId } = getAuth(req as any) || {};
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { settlementId, method, successUrl, cancelUrl } = bodySchema.parse(await req.json());

  const s = supabaseAdmin();
  const { data: settlement, error } = await s.from('project_settlements')
    .select('*').eq('id', settlementId).single();

  if (error || !settlement || settlement.vendor_id !== userId) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  if (method === 'stripe') {
    // Stripe環境変数チェック
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'stripe_not_configured' }, { status: 503 });
    }

    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        { price_data: {
            currency: 'jpy',
            product_data: { name: '成功手数料（NeedPort）' },
            unit_amount: settlement.fee_amount,
          },
          quantity: 1
        }
      ],
      success_url: successUrl + '?sid={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl,
      metadata: {
        type: 'settlement_fee',
        settlementId: settlement.id,
        vendorId: settlement.vendor_id,
        needId: settlement.need_id,
      }
    });

    await s.from('project_settlements')
      .update({ method: 'stripe', status: 'pending', stripe_checkout_session: session.id })
      .eq('id', settlement.id);

    return NextResponse.json({ url: session.url });
  }

  // bank_transfer: 参照コードを発行してpendingに
  const ref = 'NP-' + settlement.id.slice(0,8).toUpperCase();
  await s.from('project_settlements')
    .update({ method: 'bank_transfer', status: 'pending', bank_transfer_ref: ref })
    .eq('id', settlement.id);

  return NextResponse.json({
    method: 'bank_transfer',
    ref,
    instructions: '指定口座に手数料をお振込ください。入金確認後に反映されます。'
  });
}
