import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { withRateLimit, RATE_LIMITS } from "@/lib/rateLimit";

async function healthHandler(req: NextRequest) {
  const errorId = Math.random().toString(36).substring(2, 15);
  const timestamp = new Date().toISOString();

  try {
    // Basic health check - just return OK
    return NextResponse.json({
      status: "ok",
      timestamp,
      service: "needport-api",
      version: process.env.NEXT_PUBLIC_BUILD_SHA || "unknown"
    });

  } catch (error) {
    // Don't expose stack traces in production
    console.error(`Health check error [${errorId}]:`, error);
    
    return NextResponse.json({
      status: "error",
      errorId,
      timestamp,
      service: "needport-api"
    }, { status: 500 });
  }
}

export const GET = withRateLimit(
  { limit: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  healthHandler
);
