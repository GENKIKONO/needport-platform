import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

// In-memory throttling store (in production, use Redis)
const throttleStore = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: NextRequest) {
  try {
    const { path, needId, utm } = await request.json();
    
    if (!path) {
      return NextResponse.json(
        { error: "Path is required" },
        { status: 400 }
      );
    }

    // Get IP address
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwarded?.split(",")[0] || realIp || "unknown";

    // Get user agent
    const ua = request.headers.get("user-agent") || "unknown";

    // Get referer
    const referer = request.headers.get("referer") || null;

    // Get or create client ID
    const cookieStore = await cookies();
    let clientId = cookieStore.get("np_client")?.value;
    
    if (!clientId) {
      clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      // Note: In a real implementation, you'd set the cookie here
      // For now, we'll just use the generated ID
    }

    // Throttling: max 20 views per client per minute
    const now = Date.now();
    const throttleKey = `${clientId}:${Math.floor(now / 60000)}`; // minute-based key
    const throttleData = throttleStore.get(throttleKey);

    if (throttleData && throttleData.resetTime > now) {
      if (throttleData.count >= 20) {
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

    // Log page view to database
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("page_views")
      .insert({
        path,
        need_id: needId || null,
        referer,
        utm: utm || null,
        client_id: clientId,
        ua,
        ip,
      });

    if (error) {
      console.error("Failed to log page view:", error);
      return NextResponse.json(
        { error: "Failed to log page view" },
        { status: 500 }
      );
    }

    // Set client ID cookie if not already set
    const response = NextResponse.json({ success: true });
    if (!cookieStore.get("np_client")) {
      response.cookies.set("np_client", clientId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    return response;
  } catch (error) {
    console.error("Error in page view tracking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
