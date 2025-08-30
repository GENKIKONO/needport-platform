import { NextResponse } from 'next/server';
// import { db } from '@/lib/db';
import { insertAudit } from '@/lib/audit';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const key = req.headers.get('x-admin-key');
  if (!key || key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const id = params.id;
  // const need = await db.needs.findById(id);
  // if (!need || need.status !== 'review') return NextResponse.json({ error: 'invalid_state' }, { status: 400 });
  // await db.needs.update(id, { status: 'published' });
  await insertAudit({ actorType: 'system', action: 'need.publish', targetType: 'need', targetId: id });
  return NextResponse.json({ ok: true });
}
