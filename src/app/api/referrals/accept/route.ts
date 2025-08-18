export const runtime = "nodejs"; export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUserByEmail, acceptReferral } from "@/lib/trust/store";

export async function POST(req: NextRequest) {
  const { token, email, name } = await req.json();
  if (!token || !email) return NextResponse.json({ error:"token and email required" }, { status:400 });
  const user = await getOrCreateUserByEmail(email, name);
  const r = await acceptReferral(token, user.id);
  if (!r.ok) return NextResponse.json({ error:`referral ${r.reason}` }, { status:400 });
  return NextResponse.json({ ok:true, userId:user.id, referrerId:r.referrerId });
}
