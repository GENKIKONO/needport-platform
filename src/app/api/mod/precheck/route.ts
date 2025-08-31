import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { findNgMatches } from '@/lib/mod/ng';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';

const schema = z.object({
  kind: z.enum(['need','message']),
  targetId: z.string().uuid().optional(),
  text: z.string().min(1)
});

export async function POST(req:Request){
  const { userId } = auth();
  const body = await req.json().catch(()=>({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error:'invalid_input' }, { status:400 });

  const sa = supabaseAdmin();
  const { data:dict } = await sa.from('ng_words').select('pattern,is_regex,severity').eq('enabled', true);
  const matches = findNgMatches(parsed.data.text, (dict ?? []) as any);

  // high があれば即NG、medium以上で「要審査」など運用に応じて
  const hasHigh = matches.some(m=>m.severity==='high');
  const level = hasHigh ? 'block' : matches.length ? 'review' : 'pass';

  if (matches.length && userId) {
    await sa.from('ng_match_logs').insert({
      kind: parsed.data.kind, target_id: parsed.data.targetId ?? null, matches, created_by: userId
    });
  }
  return NextResponse.json({ level, matches });
}
