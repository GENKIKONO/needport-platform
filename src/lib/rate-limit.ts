const buckets = new Map<string, { ts: number; count: number }>();

export function allow(ip: string, limit = 10, windowMs = 10_000) {
  const now = Date.now();
  const b = buckets.get(ip) ?? { ts: now, count: 0 };
  if (now - b.ts > windowMs) { b.ts = now; b.count = 0; }
  b.count++;
  buckets.set(ip, b);
  return b.count <= limit;
}
