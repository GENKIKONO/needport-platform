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

  // NGプリチェック
  const pv = await fetch(`${process.env.PLATFORM_ORIGIN}/api/mod/precheck`, {
    method:'POST', headers:{'content-type':'application/json','x-needport-internal':'1'},
    body: JSON.stringify({ kind:'need', text: parsed.data.summary })
  }).then(r=>r.json()).catch(()=>({ level:'pass' }));
  if (pv.level === 'block') return NextResponse.json({ error:'ng_blocked' }, { status:400 });
  // review状態で作成は既定。pv.level==='review' の場合は UIに「審査中」を出すなど。

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
