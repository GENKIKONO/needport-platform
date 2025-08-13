-- IP throttling table for anti-spam protection
-- Tracks request counts per IP per day per endpoint

create table if not exists public.ip_throttle (
  ip text not null,
  path text not null,
  day date not null,
  hits integer not null default 1,
  updated_at timestamptz default now(),
  primary key (ip, path, day)
);

-- Enable RLS
alter table public.ip_throttle enable row level security;

-- Block all operations for anon (admin only)
create policy "Block all operations for anon" on public.ip_throttle
  for all to anon
  using (false)
  with check (false);

-- Allow all operations for authenticated users (admin)
create policy "Allow all operations for authenticated users" on public.ip_throttle
  for all to authenticated
  using (true)
  with check (true);

-- Add indexes for performance
create index if not exists idx_ip_throttle_ip_day on public.ip_throttle(ip, day);
create index if not exists idx_ip_throttle_updated_at on public.ip_throttle(updated_at);

-- Add comment for documentation
comment on table public.ip_throttle is 'IP-based rate limiting for anti-spam protection';
