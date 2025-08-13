-- Settings table for admin-configurable values
-- Stores key-value pairs with ENV fallback support

create table if not exists public.settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

-- No RLS (admin uses service role only)
alter table public.settings disable row level security;

-- Add indexes for performance
create index if not exists idx_settings_updated_at on public.settings(updated_at desc);

-- Add comment for documentation
comment on table public.settings is 'Admin-configurable settings with ENV fallback support';
