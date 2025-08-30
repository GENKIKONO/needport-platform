// Simple devAuth replacement for admin pages
import { readSession } from "./simpleSession";

export function getDevSession() {
  const session = readSession();
  return session ? { user: session } : null;
}

export function getDevUser() {
  const session = readSession();
  return session ? { id: session.userId, email: session.email } : null;
}
