import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/server/supabase";

// In-memory throttling store (in production, use Redis)
const throttleStore = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: NextRequest) {
  try {
    const { name, message, stack, path } = await request.json();

    // Get IP address
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwarded?.split(",")[0] || realIp || "unknown";

    // Get user agent
    const ua = request.headers.get("user-agent") || "unknown";

    // Throttling: max 10 errors per IP per minute
    const now = Date.now();
    const throttleKey = `${ip}:${Math.floor(now / 60000)}`; // minute-based key
    const throttleData = throttleStore.get(throttleKey);

    if (throttleData && throttleData.resetTime > now) {
      if (throttleData.count >= 10) {
        return NextResponse.json(
          { error: "Rate limit exceeded" },
          { status: 429 }
        );
      }
      throttleData.count++;
    } else {
      throttleStore.set(throttleKey, { count: 1, resetTime: now + 60000 });
    }

    // Clean up old throttle entries (older than 5 minutes)
    for (const [key, data] of throttleStore.entries()) {
      if (data.resetTime < now - 300000) {
        throttleStore.delete(key);
      }
    }

    // Log error to database
    const supabase = supabaseServer();
    const { error } = await supabase
      .from("client_errors")
      .insert({
        name: name || "Unknown Error",
        message: message || "",
        stack: stack || "",
        path: path || "",
        ua,
        ip,
      });

    if (error) {
      console.error("Failed to log client error:", error);
      return NextResponse.json(
        { error: "Failed to log error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in client error logging:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
