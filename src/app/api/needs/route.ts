import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

const NeedInput = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  summary: z.string().optional(),
  region: z.string().optional(),
  category: z.string().optional(),
  pii_email: z.string().email().optional(),
  pii_phone: z.string().optional(),
  pii_address: z.string().optional(),
});

export async function POST(req: Request) {
  const startedAt = Date.now();
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await req.json().catch(() => ({}));
    const parsed = NeedInput.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const input = parsed.data;

    // 必須列に確実に値を用意（DBに存在が確定している列のみ）
    const payload: any = {
      title: input.title,
      summary: (input.summary && input.summary.trim()) || input.title,
      body: input.body,
      created_by: userId,
      // area は schema fix 後に利用可能
      ...(input.region ? { area: input.region } : {}),
      // PII fields (if they exist in schema)
      ...(input.pii_email ? { pii_email: input.pii_email } : {}),
      ...(input.pii_phone ? { pii_phone: input.pii_phone } : {}),
      ...(input.pii_address ? { pii_address: input.pii_address } : {}),
    };

    const supabase = createClient();
    const { data, error } = await supabase.from('needs').insert(payload).select('id').limit(1);

    if (error) {
      console.error('[NEEDS_INSERT_ERROR]', { payloadKeys: Object.keys(payload), error });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data?.[0]?.id }, { status: 201 });
  } catch (e: any) {
    console.error('[NEEDS_POST_FATAL]', { message: e?.message, stack: e?.stack });
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  } finally {
    console.info('[NEEDS_POST_FINISH]', { ms: Date.now() - startedAt });
  }
}

export async function GET() {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("needs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error('[NEEDS_GET_ERROR]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ needs: data || [] });
  } catch (error) {
    console.error('[NEEDS_GET_FATAL]', error);
    return NextResponse.json({ error: 'Failed to fetch needs' }, { status: 500 });
  }
}