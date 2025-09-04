import { NextResponse } from "next/server";
// CRON: daily
export const dynamic = "force-dynamic";
export async function GET(){
  // TODO: Supabaseで
  // 1) 60日未成約 -> status=archived, archived_at=now()
  // 2) float_score = floor(float_score*0.85) where status='archived'
  // 3) surfaced_until < now() のものを通常海中セクションへ
  console.log("daily job executed");
  return NextResponse.json({ok:true});
}
