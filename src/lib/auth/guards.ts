import { Role } from './roles';

export function ensureRoleAllowed<T extends string>(
  role: Role,
  allowed: T[],
  fallback: string
): string | null {
  return allowed.includes(role as T) ? null : fallback;
}

export function requireAuth(role: Role, fallback: string = '/auth/login'): string | null {
  return role === 'guest' ? fallback : null;
}

export function requireVendor(role: Role, fallback: string = '/vendor/register'): string | null {
  return role === 'vendor' || role === 'admin' ? null : fallback;
}

export function requireAdmin(role: Role, fallback: string = '/me'): string | null {
  return role === 'admin' ? null : fallback;
}
