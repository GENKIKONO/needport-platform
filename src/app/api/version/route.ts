import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    release: process.env.NEXT_PUBLIC_RELEASE || null,
    ts: Date.now(),
    note: "hotfix-check"
  });
}
