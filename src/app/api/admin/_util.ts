import { NextRequest, NextResponse } from "next/server";

export function guard(req: NextRequest) {
  const token = process.env.ADMIN_ACCESS_TOKEN;
  const cookie = req.cookies.get("admin_token")?.value;
  if (!token || cookie !== token) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return null;
}
