import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try{
    const { needId, body } = await req.json();
    if(!body || String(body).trim().length < 50){
      return NextResponse.json({ ok:false, error:'validation' }, { status: 400 });
    }
    // 本番DB未接続のため、いまは受理ログだけ返す
    console.log('[proposal draft]', { needId, bodyLen: String(body).length });
    return NextResponse.json({ ok:true, status:'draft' });
  }catch(e){
    return NextResponse.json({ ok:false }, { status:200 });
  }
}
