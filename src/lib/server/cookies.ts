import { cookies } from 'next/headers';

export interface CookieOptions {
  maxAge?: number;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export async function setClientIdCookie(clientId: string, options: CookieOptions = {}) {
  const cookieStore = await cookies();
  
  const {
    maxAge = 400 * 24 * 60 * 60 * 1000, // 400 days
    domain = process.env.COOKIE_DOMAIN,
    path = '/',
    secure = process.env.NODE_ENV === 'production',
    httpOnly = true,
    sameSite = 'lax'
  } = options;

  cookieStore.set('np_client', clientId, {
    maxAge,
    domain,
    path,
    secure,
    httpOnly,
    sameSite
  });
}

export async function getClientIdCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('np_client')?.value;
}

export async function clearClientIdCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('np_client');
}

export function generateClientId(): string {
  return crypto.randomUUID();
}

export async function getOrCreateClientId(): Promise<string> {
  let clientId = await getClientIdCookie();
  
  if (!clientId) {
    clientId = generateClientId();
    await setClientIdCookie(clientId);
  }
  
  return clientId;
}
