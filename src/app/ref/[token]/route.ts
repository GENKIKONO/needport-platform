import { NextRequest, NextResponse } from "next/server";
export const runtime = "edge"; export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const res = NextResponse.redirect(new URL("/needs/new", req.nextUrl));
  res.cookies.set("intro_token", params.token, { httpOnly:true, secure:true, maxAge:60*60*24*14, sameSite:"lax", path:"/" });
  return res;
}
