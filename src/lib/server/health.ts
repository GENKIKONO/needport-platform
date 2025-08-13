export type Health = {
  clerk: 'ok' | 'na';
  stripe: 'ok' | 'na';
  connect: 'ok' | 'na';
  supabase: 'ok' | 'na';
  timestamp: string;
};

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getHealthStatus() : Health {
  const ok = (b: unknown) => (b ? 'ok' : 'na');
  return {
    clerk: ok(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
    stripe: ok(process.env.STRIPE_SECRET_KEY),
    connect: ok(process.env.STRIPE_SECRET_KEY),
    supabase: ok(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    timestamp: new Date().toISOString(),
  };
}
