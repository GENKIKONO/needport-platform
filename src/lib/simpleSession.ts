// Minimal, framework-safe session helper (no external deps)
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

export const SESSION_COOKIE = "np_session"; // value example: "v1:user@example.com"

export interface SimpleSession {
  email: string;
  name?: string;
  userId: string;
}

export function readSession(): SimpleSession | null {
  // SSR-safe read
  const c = cookies().get(SESSION_COOKIE)?.value || "";
  const [v, email, name, userId] = c.split(":");
  if (v !== "v1" || !email || !userId) return null;
  return { email, name, userId };
}

export function isAuthed(): boolean {
  return !!readSession();
}

export function writeSession(session: SimpleSession): NextResponse {
  const response = NextResponse.json({ ok: true });
  const sessionValue = `v1:${session.email}:${session.name || ''}:${session.userId}`;
  response.cookies.set(SESSION_COOKIE, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
  return response;
}

export function clearSession(): NextResponse {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}

// For client components (optional): read from response headers (not required now)
export function getHost(): string {
  return headers().get("host") || "";
}
