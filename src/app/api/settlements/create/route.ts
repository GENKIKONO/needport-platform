import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getAuth } from '@clerk/nextjs/server';

const bodySchema = z.object({
  needId: z.string().uuid(),
  finalPrice: z.number().int().positive(),
  feeRate: z.number().min(0.01).max(0.3).default(0.10),
});

export async function POST(req: Request) {
  const { userId } = getAuth(req as any) || {};
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const json = await req.json();
  const { needId, finalPrice, feeRate } = bodySchema.parse(json);
  const feeAmount = Math.ceil(finalPrice * feeRate);

  const s = supabaseAdmin();
  const { data, error } = await s
    .from('project_settlements')
    .insert({
      need_id: needId,
      vendor_id: userId,
      final_price: finalPrice,
      fee_rate: feeRate,
      fee_amount: feeAmount,
      method: 'stripe',
      status: 'draft',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settlement: data });
}
