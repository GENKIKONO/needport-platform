import { NextRequest } from 'next/server';
import { fetchNeedAndAdoptedOffer } from '@/lib/server/ops';
import { buildLineText, buildOpsEmail } from '@/lib/server/templates';
import { sendOpsEmail } from '@/lib/server/mailer';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-ops-token') || req.nextUrl.searchParams.get('token');
  const must = process.env.OPS_TOKEN;
  if (must && token !== must) {
    return new Response(JSON.stringify({ ok:false, error:'unauthorized' }), { status: 401 });
  }
  const { needId } = await req.json().catch(() => ({}));
  if (!needId) return new Response(JSON.stringify({ ok:false, error:'needId required' }), { status: 400 });

  try {
    const { need, offer } = await fetchNeedAndAdoptedOffer(needId);
    const lineText = buildLineText(need, offer);
    const email = buildOpsEmail(need, offer);
    const result = await sendOpsEmail(email);
    return new Response(JSON.stringify({ ok:true, email: result, lineText }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (e:any) {
    return new Response(JSON.stringify({ ok:false, error: e?.message || 'failed' }), { status: 500 });
  }
}
