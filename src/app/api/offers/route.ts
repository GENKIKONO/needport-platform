import { NextResponse } from 'next/server';
import { sbSrv, sbAnon } from '@/lib/sb';
import { getOrCreateHandle } from '@/lib/user-handle';

export const dynamic='force-dynamic'; 
export const revalidate=0; 
export const runtime='nodejs';

export async function POST(req:Request){
  const body = await req.json();
  const { need_id, price_yen, memo } = body || {};
  if(!need_id) return NextResponse.json({error:'need_id required'},{status:400});
      const provider = await getOrCreateHandle(); // 企業側の仮ハンドル

  const { error } = await sbSrv().from('offers').insert({ need_id, provider_handle: provider, price_yen, memo });
  if(error) return NextResponse.json({error:error.message},{status:500});
  return new NextResponse(null,{status:201});
}

export async function GET(req:Request){
  const { searchParams } = new URL(req.url);
  const need_id = searchParams.get('need_id');
  if(!need_id) return NextResponse.json({error:'need_id required'},{status:400});
  const { data, error } = await sbAnon().from('offers').select('*').eq('need_id', need_id).order('created_at', { ascending:false });
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json(data);
}
