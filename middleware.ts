import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "np_admin";
const ADMIN_PREFIX = "/admin";

export function middleware(req: NextRequest) {
  const { pathname, hostname } = req.nextUrl;
  
  // www → apex redirect
  if (hostname === 'www.needport.jp') {
    const url = req.nextUrl.clone();
    url.hostname = 'needport.jp';
    return NextResponse.redirect(url, 301);
  }
  
  // Skip for assets and API routes that should be public
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api") && !pathname.startsWith("/api/admin")
  ) {
    return NextResponse.next();
  }

  // Handle admin routes (both pages and APIs)
  if (pathname.startsWith(ADMIN_PREFIX) || pathname.startsWith("/api/admin")) {
    // Allow login/logout endpoints
    if (pathname === "/admin/login" || pathname === "/api/admin/login" || pathname === "/api/admin/logout") {
      return NextResponse.next();
    }

    const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
    if (cookie === "1") return NextResponse.next();

    // For API routes, return 401 JSON
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 }
      );
    }

    // For page routes, redirect to login
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/|api/stripe/webhook).*)",
    "/admin/:path*", 
    "/api/:path*"
  ],
};
