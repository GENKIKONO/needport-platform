export const runtime = "nodejs"; export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/app/api/admin/_util";
import { createReferralToken, saveReferralInvite } from "@/lib/trust/store";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const g = guard(req); if (g) return g; // 管理ガード
  const { referrerId = "admin", expiresInDays = 14, needId } = await req.json().catch(()=>({}));
  const tok = await createReferralToken(referrerId, expiresInDays);
  const origin = req.headers.get("x-forwarded-host") ? `${req.nextUrl.protocol}//${req.headers.get("x-forwarded-host")}` : req.nextUrl.origin;
  const inviteUrl = `${origin}/ref/${tok.token}`;
  
  // 履歴を保存
  await saveReferralInvite({
    id: randomUUID(),
    needId: needId || undefined,
    url: inviteUrl,
    createdAt: tok.createdAt,
  });
  
  return NextResponse.json({ token: tok.token, inviteUrl, expiresAt: tok.expiresAt });
}
