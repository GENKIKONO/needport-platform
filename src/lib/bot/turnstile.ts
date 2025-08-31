export async function verifyTurnstileToken(token?: string) {
  if (!process.env.TURNSTILE_SECRET_KEY) return { ok: true }; // 本番では必須
  if (!token) return { ok: false };
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type':'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY!,
        response: token
      })
    });
    const json = await res.json();
    return { ok: !!json.success, data: json };
  } catch {
    return { ok: false };
  }
}
