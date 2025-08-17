'use server';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

export async function getUserHandle() {
  const c = cookies();
  let h = c.get('np_user')?.value;
  if (!h) {
    h = 'u_' + randomBytes(6).toString('hex');
    c.set('np_user', h, { httpOnly: false, sameSite: 'lax', path: '/', maxAge: 60*60*24*365 });
  }
  return h;
}
