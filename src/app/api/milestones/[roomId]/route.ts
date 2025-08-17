import { NextResponse } from 'next/server';
import { sbSrv, sbAnon } from '@/lib/sb';

export const dynamic='force-dynamic'; 
export const revalidate=0; 
export const runtime='nodejs';

export async function GET(_req:Request,{params}:{params:{roomId:string}}){
  const { data, error } = await sbAnon().from('milestones').select('*').eq('room_id', params.roomId).order('created_at');
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json(data);
}

export async function POST(req:Request,{params}:{params:{roomId:string}}){
  const body = await req.json(); 
  const { title, due_date, amount_yen } = body||{};
  if(!title) return NextResponse.json({error:'title required'},{status:400});
  const { error } = await sbSrv().from('milestones').insert({
    room_id: params.roomId, title, due_date, amount_yen
  });
  if(error) return NextResponse.json({error:error.message},{status:500});
  return new NextResponse(null,{status:201});
}
