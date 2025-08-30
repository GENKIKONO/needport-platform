import { NextResponse } from 'next/server';
import { ProposalCreateSchema } from '@/schemas/proposal';
import { verifyTurnstile } from '@/lib/turnstile';
import { insertAudit } from '@/lib/audit';
import { rateLimitOr400 } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const tokenHeader = req.headers.get('x-turnstile-token');

  const v = await verifyTurnstile(tokenHeader, ip);
  if (!v.ok) {
    return NextResponse.json({ error: 'turnstile_failed', detail: v.reason }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = ProposalCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input', detail: parsed.error.flatten() }, { status: 400 });
  }

  // レート制限チェック
  if (!rateLimitOr400(ip)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const s = supabaseAdmin();
  const { data, error } = await s.from('proposals').insert({
    need_id: parsed.data.needId,
    message: parsed.data.message,
    estimate: parsed.data.estimate,
    status: 'review'
  } as any).select('id').single();
  
  if (error) {
    console.error('[proposals:insert_error]', error);
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }
  
  await insertAudit({ 
    actorType: 'user', 
    action: 'proposal.create', 
    targetType: 'proposal', 
    targetId: data.id 
  });
  
  return NextResponse.json({ ok: true, id: data.id, status: 'review' });
}
