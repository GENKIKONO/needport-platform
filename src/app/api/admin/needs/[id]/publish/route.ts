import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { insertAudit } from '@/lib/audit';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const key = req.headers.get('x-admin-key');
  if (!key || key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const id = params.id;
  
  // TODO: Supabase テーブル型定義後に実装
  // const s = supabaseAdmin();
  // const { error } = await s.from('needs').update({ status: 'published' }).eq('id', id);
  // if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });
  
  await insertAudit({ actorType: 'admin', action: 'need.publish', targetType: 'need', targetId: id });
  return NextResponse.json({ ok: true });
}
