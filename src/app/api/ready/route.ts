import { NextResponse } from "next/server";
import { FLAGS } from "@/config/flags";

export async function GET() {
  return NextResponse.json({
    ok: true,
    prod: {
      uiV2Default: !!FLAGS.UI_V2_DEFAULT,
      canonicalHost: FLAGS.CANONICAL_HOST || null,
      stripeCapture: !FLAGS.DISABLE_STRIPE_CAPTURE ? true : false,
    },
    runtime: {
      vercelEnv: process.env.VERCEL_ENV || null,
      nodeEnv: process.env.NODE_ENV || null,
      commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
      buildId: process.env.VERCEL_BUILD_OUTPUT_ID || null,
      region: process.env.VERCEL_REGION || null,
    }
  });
}
