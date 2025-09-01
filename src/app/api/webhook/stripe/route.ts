import { NextResponse } from "next/server";
import { FLAGS } from "@/config/flags";
export async function POST() {
  if (FLAGS.DISABLE_STRIPE_CAPTURE) {
    // 本番公開までは確定させない
    return NextResponse.json({ ok: true, skipped: true });
  }
  return NextResponse.json({ ok: true });
}
