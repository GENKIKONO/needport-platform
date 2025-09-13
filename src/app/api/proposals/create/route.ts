import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { HTTP_ERRORS, logAndReturnError } from '@/lib/http/error';

const schema = z.object({
  needId: z.string().uuid(),
  title: z.string().min(3).max(160),
  body: z.string().min(10).max(4000),
  estimatePrice: z.number().int().min(0).optional()
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return HTTP_ERRORS.UNAUTHORIZED();
    }

    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return HTTP_ERRORS.BAD_REQUEST('invalid_input', parsed.error.issues);
    }

    const { needId, title, body: b, estimatePrice } = parsed.data;

    // need が published か review かの確認（少なくとも draft には提案しない）
    const supabase = createClient();
    const { data: need, error: needErr } = await supabase
      .from('needs')
      .select('id,category')
      .eq('id', needId)
      .maybeSingle();
    
    if (needErr || !need) {
      return HTTP_ERRORS.NOT_FOUND('need_not_found');
    }

    const { data, error } = await supabase
      .from('proposals')
      .insert({
        need_id: needId,
        vendor_id: userId,
        title,
        body: b,
        estimate_price: estimatePrice ?? null
      })
      .select('id')
      .single();

    if (error) {
      return logAndReturnError(error, 'POST /api/proposals/create', 'Failed to create proposal');
    }

    // 簡易監査ログ
    console.log(`[AUDIT] PROPOSAL_CREATED: userId=${userId}, proposalId=${data.id}, needId=${needId}`);

    return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
  } catch (error) {
    return logAndReturnError(error, 'POST /api/proposals/create', 'Failed to create proposal');
  }
}
