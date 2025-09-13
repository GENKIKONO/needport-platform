import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { pushNotification } from '@/lib/notify/notify';

const schema = z.object({
  title: z.string().min(3).max(120),
  summary: z.string().min(10).max(2000),
  region: z.string().min(1).max(50),
  category: z.string().min(1).max(50),
  deadline: z.string().optional(), // ISO
  pii_phone: z.string().optional(),
  pii_email: z.string().email().optional(),
  pii_address: z.string().optional(),
  // care_taxi の5W1H最小投稿に対応
  kind: z.enum(['default','care_taxi']).optional().default('default'),
  when_date: z.string().optional(),
  when_time: z.string().optional(),
  where_from: z.string().optional(),
  where_to: z.string().optional(),
  who_count: z.number().min(1).optional(),
  wheelchair: z.boolean().optional(),
  helpers_needed: z.number().min(0).optional(),
  notes: z.string().optional(),
  // 業種指定（任意）
  industry_id: z.string().uuid().optional()
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

  // NGプリチェック
  const pv = await fetch(`${process.env.PLATFORM_ORIGIN}/api/mod/precheck`, {
    method:'POST', headers:{'content-type':'application/json','x-needport-internal':'1'},
    body: JSON.stringify({ kind:'need', text: parsed.data.summary })
  }).then(r=>r.json()).catch(()=>({ level:'pass' }));
  if (pv.level === 'block') return NextResponse.json({ error:'ng_blocked' }, { status:400 });
  // review状態で作成は既定。pv.level==='review' の場合は UIに「審査中」を出すなど。

  const sadmin = supabaseAdmin();
  
  // care_taxi の場合の設定を強制 - creator_id removed to avoid UUID issues
  const insertData = {
    ...parsed.data,
    status: 'review'            // 作成時は review へ
  };
  
  if (parsed.data.kind === 'care_taxi') {
    insertData.user_reveal_policy = 'accepted';
    insertData.vendor_visibility = 'public';
  }
  
  // industry_id が指定されている場合の課金方針分岐
  if (parsed.data.industry_id) {
    const { data: industry } = await sadmin
      .from('industries')
      .select('fee_applicable')
      .eq('id', parsed.data.industry_id)
      .maybeSingle();
    
    if (industry && !industry.fee_applicable) {
      insertData.user_reveal_policy = 'accepted';
      insertData.vendor_visibility = 'public';
    }
  }
  
  const { data, error } = await sadmin
    .from('needs')
    .insert(insertData)
    .select('id,status')
    .single();

  if (error) {
    console.error('[NEEDS_CREATE_ERROR]', { error: error.message, code: error.code });
    return NextResponse.json({ error: 'DB_ERROR', detail: error.message }, { status: 500 });
  }

  // 監査
  await sadmin.from('audit_logs').insert({
    actor_id: userId,
    action: 'NEED_CREATED',
    target_type: 'need',
    target_id: data.id,
    meta: { status: data.status }
  });

  // 既存の通り review で作成（管理者の /api/needs/publish でのみ公開）
  // 追加: 投稿者本人にも「審査中」トースト/通知を出す（notifyUser を呼ぶ）
  await pushNotification({
    userId: userId,
    type: 'system',
    title: 'ニーズ投稿を受け付けました',
    body: '審査後に公開されます。',
    meta: { needId: data.id }
  });

  return NextResponse.json({ ok: true, id: data.id, status: data.status });
}
