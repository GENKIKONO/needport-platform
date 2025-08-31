import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';

const schema = z.object({
  title: z.string().min(3).max(120),
  summary: z.string().min(10).max(2000),
  region: z.string().min(1).max(50),
  category: z.string().min(1).max(50),
  deadline: z.string().optional(), // ISO
  pii_phone: z.string().optional(),
  pii_email: z.string().email().optional(),
  pii_address: z.string().optional()
});

export async function POST(req: Request) {
  // 未ログインでも受けるなら auth は不要（今回はログイン必須に）
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input', issues: parsed.error.issues }, { status: 400 });
  }

  const sadmin = supabaseAdmin();
  const { data, error } = await sadmin
    .from('needs')
    .insert({
      ...parsed.data,
      status: 'review',            // 作成時は review へ
      creator_id: userId
    })
    .select('id,status')
    .single();

  if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });

  // 監査
  await sadmin.from('audit_logs').insert({
    actor_id: userId,
    action: 'NEED_CREATED',
    target_type: 'need',
    target_id: data.id,
    meta: { status: data.status }
  });

  return NextResponse.json({ ok: true, id: data.id, status: data.status });
}
