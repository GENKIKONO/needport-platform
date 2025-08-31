import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { recordApproval, notifyDecision } from '@/lib/approvals/hooks';

const schema = z.object({
  messageId: z.string().uuid(),
  reasonText: z.string().max(2000).optional(),
  templateId: z.string().uuid().optional()
});

async function ensureAdmin(uid?:string){
  if(!uid) return false;
  const { data } = await supabaseAdmin().from('user_roles').select('role').eq('user_id', uid).eq('role','admin').maybeSingle();
  return !!data;
}

export async function POST(req:Request){
  const { userId } = auth(); if(!await ensureAdmin(userId)) return NextResponse.json({ error:'forbidden' }, { status:403 });
  const body = await req.json().catch(()=>({}));
  const parsed = schema.safeParse(body);
  if(!parsed.success) return NextResponse.json({ error:'invalid_input' }, { status:400 });

  const sadmin = supabaseAdmin();
  // message の公開フラグ（例：visible=true）で相手に見えるように
  const { error } = await sadmin.from('proposal_messages').update({ visible:true, updated_at:new Date().toISOString() }).eq('id', parsed.data.messageId);
  if(error) return NextResponse.json({ error:'db_error' }, { status:500 });

  await recordApproval('message', parsed.data.messageId, 'approve', parsed.data.reasonText, parsed.data.templateId, userId!);
  await notifyDecision('message', parsed.data.messageId, 'approve');

  return NextResponse.json({ ok:true });
}
