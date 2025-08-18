export const runtime = "nodejs"; export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/app/api/admin/_util";
import { createReferralToken } from "@/lib/trust/store";

export async function POST(req: NextRequest) {
  const g = guard(req); if (g) return g; // 管理ガード
  const { referrerId = "admin", expiresInDays = 14 } = await req.json().catch(()=>({}));
  const tok = await createReferralToken(referrerId, expiresInDays);
  const origin = req.headers.get("x-forwarded-host") ? `${req.nextUrl.protocol}//${req.headers.get("x-forwarded-host")}` : req.nextUrl.origin;
  const url = `${origin}/ref/${tok.token}`;
  return NextResponse.json({ token: tok.token, inviteUrl: url, expiresAt: tok.expiresAt });
}
