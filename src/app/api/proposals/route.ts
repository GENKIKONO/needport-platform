import { NextResponse } from 'next/server';
import { ProposalCreateSchema } from '@/schemas/proposal';
import { verifyTurnstile } from '@/lib/turnstile';
import { insertAudit } from '@/lib/audit';
import { rateLimitOr400 } from '@/lib/rate-limit';
import { emailService } from '@/lib/notifications/email';
import { supabaseAdmin } from '@/lib/supabase/admin';

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

  // Send email notification for new proposal (Lv1)
  try {
    // Get need and requester information
    const { data: needInfo } = await s
      .from('needs')
      .select('title, user_id')
      .eq('id', parsed.data.needId)
      .single();

    if (needInfo) {
      // Get requester email
      const { data: requesterProfile } = await s
        .from('profiles')
        .select('email')
        .eq('id', needInfo.user_id)
        .single();

      if (requesterProfile?.email) {
        await emailService.sendProposalNotification(requesterProfile.email, {
          needTitle: needInfo.title,
          proposerName: 'New Proposer', // In real implementation, get from auth or form data
          estimateAmount: parsed.data.estimate || 0,
          needId: parsed.data.needId
        });
      }
    }
  } catch (emailError) {
    // Don't fail the proposal creation if email fails
    console.error('Failed to send proposal email notification:', emailError);
  }
  
  return NextResponse.json({ ok: true, id: data.id, status: 'review' });
}
