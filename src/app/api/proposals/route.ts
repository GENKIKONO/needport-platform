import { NextResponse } from 'next/server';
import { ProposalCreateSchema } from '@/schemas/proposal';
import { verifyTurnstile } from '@/lib/turnstile';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? undefined;
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

  // const inserted = await db.proposals.insert({ ...parsed.data, status: 'review' });
  // return NextResponse.json({ ok: true, id: inserted.id });
  return NextResponse.json({ ok: true, id: 'mock-prop', status: 'review' });
}
