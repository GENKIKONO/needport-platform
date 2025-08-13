import { NextRequest, NextResponse } from "next/server";
import { withRateLimit, RATE_LIMITS } from "@/lib/rateLimit";

const ADMIN_COOKIE = "admin_pin";
const CSRF_COOKIE = "csrf_token";

// Read PIN from env; fall back to "1234" for dev (show a hint)
const PIN = process.env.ADMIN_PIN || "1234";

async function loginHandler(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const pin = String(body?.pin ?? "");
    const csrfToken = String(body?.csrfToken ?? "");

    // Validate CSRF token
    const storedToken = req.cookies.get(CSRF_COOKIE)?.value;
    if (!csrfToken || !storedToken || csrfToken !== storedToken) {
      return NextResponse.json({ 
        ok: false, 
        error: "セキュリティトークンが無効です。ページを再読み込みしてください。" 
      }, { status: 403 });
    }

    if (!pin) {
      return NextResponse.json({ 
        ok: false, 
        error: "PINを入力してください" 
      }, { status: 400 });
    }

    if (pin !== PIN) {
      return NextResponse.json({ 
        ok: false, 
        error: "PINが違います" 
      }, { status: 401 });
    }

    // Success - set admin cookie
    const res = NextResponse.json({ ok: true });
    
    // Set admin cookie with secure settings
    res.cookies.set(ADMIN_COOKIE, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });

    // Clear CSRF token after successful login
    res.cookies.set(CSRF_COOKIE, "", { 
      path: "/", 
      maxAge: 0 
    });

    return res;

  } catch (e: any) {
    console.error('Login error:', e);
    return NextResponse.json({ 
      ok: false, 
      error: "サーバーエラーが発生しました" 
    }, { status: 500 });
  }
}

export const POST = withRateLimit(RATE_LIMITS.ADMIN_LOGIN, loginHandler);
