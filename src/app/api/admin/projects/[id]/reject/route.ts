export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  return Response.json({ ok: false, todo: 'admin api - phase2' }, { status: 501 });
}
