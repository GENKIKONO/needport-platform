export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const notYet = (todo: string) =>
  Response.json({ ok: false, todo }, { status: 501 });

export async function GET() {
  return notYet('admin api - phase2');
}

export async function POST() {
  return notYet('admin api - phase2');
}
