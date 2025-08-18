import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getClaimByToken(token: string) {
  try {
    const { kv } = await import("@vercel/kv");
    return await kv.get<{ email: string; createdAt: string }>(`claim:${token}`);
  } catch (error) {
    console.error("Failed to get claim token:", error);
    return null;
  }
}

async function consumeClaimToken(token: string) {
  try {
    const { kv } = await import("@vercel/kv");
    await kv.del(`claim:${token}`);
  } catch (error) {
    console.error("Failed to consume claim token:", error);
  }
}

async function findOrCreateUserIdByEmail(email: string): Promise<string> {
  // 簡易実装：メールアドレスをそのままユーザーIDとして使用
  // 実際の運用では、ユーザーテーブルから検索して存在しなければ新規作成
  return email;
}

export async function GET(_: Request, { params }: { params: { token: string } }) {
  const claim = await getClaimByToken(params.token);
  if (!claim) {
    return NextResponse.redirect(
      new URL("/me?claim=invalid", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"), 
      302
    );
  }
  
  const userId = await findOrCreateUserIdByEmail(claim.email);
  
  // uid Cookieを設定
  cookies().set("uid", userId, { 
    httpOnly: false, 
    secure: true, 
    sameSite: "Lax", 
    path: "/", 
    maxAge: 60 * 60 * 24 * 180 
  });
  
  // トークンを消費
  await consumeClaimToken(params.token);
  
  return NextResponse.redirect(
    new URL("/me?claim=ok", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"), 
    302
  );
}
