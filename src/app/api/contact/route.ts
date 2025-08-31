import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';

const schema = z.object({
  email: z.string().email().optional(),
  name: z.string().max(100).optional(),
  subject: z.string().max(140).optional(),
  body: z.string().min(10).max(5000),
  cfToken: z.string().min(10),
});

async function verifyTurnstile(token: string, ip?: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return false;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {'content-type':'application/json'},
    body: JSON.stringify({ secret, response: token, remoteip: ip ?? undefined })
  });
  const data = await res.json().catch(() => ({}));
  return !!data.success;
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
  const ua = req.headers.get('user-agent') || '';

  const json = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_input' }, { status: 400 });

  const ok = await verifyTurnstile(parsed.data.cfToken, ip);
  if (!ok) return NextResponse.json({ error: 'bot_check_failed' }, { status: 400 });

  const { error } = await supabaseAdmin().from('contact_messages').insert({
    email: parsed.data.email ?? null,
    name: parsed.data.name ?? null,
    subject: parsed.data.subject ?? null,
    body: parsed.data.body,
    ua,
    ip
  });
  if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });

  // NOTE: Resend 連携は後日。ENVがあればここで送信可。

  return NextResponse.json({ ok: true });
}
