import { NextResponse } from 'next/server';

export const dynamic='force-dynamic'; 
export const revalidate=0; 
export const runtime='nodejs';

export async function POST(req:Request){
  if(process.env.NEXT_PUBLIC_STRIPE_ENABLED!=='1') {
    return NextResponse.json({ ok:false, error:'STRIPE_DISABLED' }, { status: 501 });
  }
  // ここに Stripe PaymentIntent 作成（capture_method:'manual' 推奨）を実装
  // env: STRIPE_SECRET_KEY, (任意) CONNECT_ACCOUNT_ID
  // ※ 実装は環境が揃った時点で差し込み
  return NextResponse.json({ ok:true, note:'Stripe wiring placeholder' }, { status: 200 });
}
