import 'server-only';
import { getDevSession } from '@/lib/devAuth';

export function requireUserId() {
  // For now, return a dev user ID when authenticated
  return 'dev-user-1';
}

export function getUserId() {
  // For now, return a dev user ID when authenticated
  return 'dev-user-1';
}

export function requireAuth() {
  // For now, return a dev auth object
  return { userId: 'dev-user-1' };
}
