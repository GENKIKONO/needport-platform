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

  // TODO: Supabase テーブル型定義後に実装
  // const inserted = await db.proposals.insert({ ...parsed.data, status: 'review' });
  
  const mockId = 'proposal-' + Date.now();
  await insertAudit({ 
    actorType: 'user', 
    action: 'proposal.create', 
    targetType: 'proposal', 
    targetId: mockId 
  });
  
  return NextResponse.json({ ok: true, id: mockId, status: 'review' });
}
