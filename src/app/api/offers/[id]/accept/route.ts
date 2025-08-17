import { NextResponse } from 'next/server';
import { sbSrv, sbAnon } from '@/lib/sb';
import { cookies } from 'next/headers';

export const dynamic='force-dynamic'; 
export const revalidate=0; 
export const runtime='nodejs';

export async function POST(_:Request,{params}:{params:{id:string}}){
  const offerId = params.id;
  const srv = sbSrv();

  // 提案取得
  const { data: offer, error: oe } = await srv.from('offers').select('*').eq('id', offerId).single();
  if(oe || !offer) return NextResponse.json({error:'offer not found'},{status:404});

  // ルーム作成
  const { data: room, error: re } = await srv.from('rooms').insert({
    need_id: offer.need_id, offer_id: offer.id, title: '案件ルーム'
  }).select('*').single();
  if(re) return NextResponse.json({error:re.message},{status:500});

  // 参加者：buyer(投稿者はとりあえず viewer として匿名) / provider / admin
  // 本当は need の投稿者ハンドルを参照するが、いまは cookie の匿名ハンドルを buyer とする
  const buyer = cookies().get('np_user')?.value || 'buyer_demo';
  const admin = 'ops';
  const rows = [
    { room_id: room.id, user_ref:`buyer:${buyer}`, role:'buyer', approved:true },
    { room_id: room.id, user_ref:`provider:${offer.provider_handle}`, role:'provider', approved:true },
    { room_id: room.id, user_ref:`admin:${admin}`, role:'admin', approved:true },
  ];
  const { error: me } = await srv.from('room_members').insert(rows);
  if(me) return NextResponse.json({error:me.message},{status:500});

  // 提案を accepted に
  await srv.from('offers').update({ status:'accepted' }).eq('id', offerId);

  return NextResponse.json({ room_id: room.id }, { status:201 });
}
