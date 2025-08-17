import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const { name = '', email = '', message = '', needId = '' } = await req.json().catch(() => ({}));
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

    const url = process.env.SUPABASE_URL;
    const anon = process.env.SUPABASE_ANON_KEY;
    const service = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (url && (service || anon)) {
      // Supabaseへ保存（leadsテーブル）
      const key = service || anon!;
      const res = await fetch(`${url}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify([{ name, email, message, need_id: needId }]),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('signup insert failed', res.status, text);
        return NextResponse.json({ error: 'insert failed' }, { status: 500 });
      }
    } else {
      // DB未設定時はログに記録して204（デモ用に動かす）
      console.log('SIGNUP (mock)', { name, email, needId });
    }
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'unexpected' }, { status: 500 });
  }
}
