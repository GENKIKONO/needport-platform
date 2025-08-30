export async function verifyTurnstile(token?: string | null, ip?: string) {
  if (process.env.DEMO_MODE === 'true') return { ok: true as const };
  if (!token) return { ok: false as const, reason: 'missing-token' };
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY ?? '',
      response: token ?? '',
      ...(ip ? { remoteip: ip } : {}),
    }),
    cache: 'no-store',
  });
  const data = await res.json();
  return { ok: !!data.success, reason: data['error-codes']?.[0] };
}
