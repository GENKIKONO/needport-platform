import { NextResponse } from "next/server";
// TODO: Supabase接続し、need_idでfloat_score/last_activity_at/surfaced_at更新
export async function POST(req: Request){
  const { need_id, reason } = await req.json().catch(()=>({}));
  if(!need_id) return NextResponse.json({ok:false, error:"missing need_id"}, {status:400});
  // 便宜上ログだけ
  console.log("surface-event", {need_id, reason});
  return NextResponse.json({ok:true});
}