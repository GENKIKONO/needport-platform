import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createAdminClientOrNull } from "@/lib/supabase/admin";
import { recordApproval, notifyDecision } from '@/lib/approvals/hooks';


// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

const schema = z.object({
  needId: z.string().uuid(),
  reasonText: z.string().min(1).max(4000),
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

  const sadmin = createAdminClientOrNull();
    
    if (!sadmin) {
      return NextResponse.json(
        { error: 'SERVICE_UNAVAILABLE', detail: 'Admin env not configured' },
        { status: 503 }
      );
    }
  // status を 'draft'（差し戻し）に
  const { error:upErr } = await sadmin.from('needs').update({ status:'draft', updated_at: new Date().toISOString() }).eq('id', parsed.data.needId);
  if(upErr) return NextResponse.json({ error:'db_error' }, { status:500 });

  await recordApproval('need', parsed.data.needId, 'reject', parsed.data.reasonText, parsed.data.templateId, userId!);
  await notifyDecision('need', parsed.data.needId, 'reject');

  return NextResponse.json({ ok:true });
}
