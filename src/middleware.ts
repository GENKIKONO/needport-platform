import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { FLAGS } from "@/config/flags";

const isPublicRoute = createRouteMatcher([
  '/',
  '/needs(.*)',
  '/vendors(.*)', 
  '/roadmap',
  '/news',
  '/login',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/(.*)',  // Allow all API routes through
  '/api/needs(.*)',
  '/api/proposals(.*)',
  '/api/offers(.*)',
  '/api/checkout(.*)',
  '/api/webhooks(.*)',
  '/api/public(.*)',
  '/api/health',
  '/api/ready'
]);

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)'
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  const { pathname, hostname } = request.nextUrl;
  
  // Canonical host redirect for production
  const env = process.env.VERCEL_ENV || process.env.NODE_ENV || "development";
  if (env === "production" && FLAGS.ENFORCE_CANONICAL) {
    const canonical = FLAGS.CANONICAL_HOST?.toLowerCase();
    if (canonical) {
      const host = request.headers.get("host")?.toLowerCase() || "";
      const proto = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "");
      
      if (host !== canonical || proto !== "https") {
        const url = request.nextUrl.clone();
        url.protocol = "https:";
        url.host = canonical;
        return NextResponse.redirect(url, 301);
      }
    }
  }

  // Admin routes require special authentication  
  if (isAdminRoute(request)) {
    // Allow login/logout endpoints
    if (pathname === "/admin/login" || pathname === "/api/admin/login" || pathname === "/api/admin/logout") {
      return NextResponse.next();
    }
    
    // Check for admin cookie for admin panel access
    const adminCookie = request.cookies.get("np_admin")?.value;
    if (adminCookie !== "1") {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json(
          { ok: false, error: "unauthorized" },
          { status: 401 }
        );
      }
      
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login"; 
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Protected routes require Clerk authentication
  if (!isPublicRoute(request)) {
    if (!userId) {
      // Redirect to sign-in page
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      url.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
