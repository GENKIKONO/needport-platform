import { NextResponse } from "next/server";
import { FLAGS } from "@/config/flags";

export async function POST(req: Request) {
  if (FLAGS.DISABLE_STRIPE_CAPTURE) {
    // 本番公開までは確定させない
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Stripe webhook処理は後で実装
  return NextResponse.json({ ok: true, notImplemented: true });
}
