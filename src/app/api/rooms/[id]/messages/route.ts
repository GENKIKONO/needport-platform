import { NextResponse } from 'next/server';
import { sbSrv, sbAnon } from '@/lib/sb';
import { getOrCreateHandle } from '@/lib/user-handle';

export const dynamic='force-dynamic'; 
export const revalidate=0; 
export const runtime='nodejs';

export async function GET(_req:Request,{params}:{params:{id:string}}){
  const { data, error } = await sbAnon()
    .from('messages').select('*').eq('room_id', params.id).order('created_at', { ascending:true }).limit(200);
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json(data);
}

export async function POST(req:Request,{params}:{params:{id:string}}){
  const body = await req.json(); 
  const { text } = body||{};
  if(!text) return NextResponse.json({error:'text required'},{status:400});
      const who = await getOrCreateHandle();
  const { error } = await sbSrv().from('messages').insert({
    room_id: params.id, user_ref: who, body: String(text).slice(0,1000)
  });
  if(error) return NextResponse.json({error:error.message},{status:500});
  return new NextResponse(null,{status:201});
}
