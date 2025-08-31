import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { z } from 'zod';

const schema = z.object({
  needId: z.string().uuid(),
  vendorId: z.string().min(1),
  finalPrice: z.number().int().positive(),
  feeRate: z.number().min(0.05).max(0.3).default(0.09) // デフォ9%
});

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  const { needId, vendorId, finalPrice, feeRate } = parsed.data;
  if (vendorId !== userId) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const feeAmount = Math.round(finalPrice * feeRate);
  const { data, error } = await supabaseAdmin()
    .from('project_settlements')
    .insert({
      need_id: needId,
      vendor_id: vendorId,
      final_price: finalPrice,
      fee_rate: feeRate,
      fee_amount: feeAmount,
      method: 'bank_transfer',
      status: 'pending',        // 入金確認後に 'paid' に更新（手動）
      bank_transfer_ref: `NP-${Date.now()}-${Math.floor(Math.random()*1000)}`
    })
    .select('id, bank_transfer_ref, fee_amount')
    .single();

  if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });
  return NextResponse.json({
    settlementId: data.id,
    reference: data.bank_transfer_ref,
    feeAmount: data.fee_amount,
    instructions: '指定口座へお振込ください。入金確認後に反映します。'
  });
}
