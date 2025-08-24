// Minimal, framework-safe session helper (no external deps)
import { cookies, headers } from "next/headers";

export const SESSION_COOKIE = "np_session"; // value example: "v1:user@example.com"

export function readSession() {
  // SSR-safe read
  const c = cookies().get(SESSION_COOKIE)?.value || "";
  const [v, email] = c.split(":");
  if (v !== "v1" || !email) return null;
  return { email };
}

export function isAuthed() {
  return !!readSession();
}

// For client components (optional): read from response headers (not required now)
export function getHost() {
  return headers().get("host") || "";
}
