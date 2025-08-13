-- Enhanced notification queue for admin notifications
-- Supports multiple event types and retry logic

-- Drop existing table if it exists (from Prompt 18)
drop table if exists public.entry_notifications;

create table if not exists public.entry_notifications (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  need_id uuid references public.needs(id) on delete cascade,
  ref_id text not null,
  status text not null default 'queued' check (status in ('queued','sent','failed')),
  retry_count integer default 0,
  last_error text,
  next_attempt_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.entry_notifications enable row level security;

-- Block all operations for anon (admin only)
create policy "Block all operations for anon" on public.entry_notifications
  for all to anon
  using (false)
  with check (false);

-- Allow all operations for authenticated users (admin)
create policy "Allow all operations for authenticated users" on public.entry_notifications
  for all to authenticated
  using (true)
  with check (true);

-- Add indexes for performance
create index if not exists idx_entry_notifications_kind on public.entry_notifications(kind);
create index if not exists idx_entry_notifications_status on public.entry_notifications(status);
create index if not exists idx_entry_notifications_next_attempt on public.entry_notifications(next_attempt_at);
create index if not exists idx_entry_notifications_created_at on public.entry_notifications(created_at desc);

-- Unique constraint to prevent duplicate notifications
create unique index if not exists uniq_entry_notifications_kind_ref
  on public.entry_notifications(kind, ref_id);

-- Add comment for documentation
comment on table public.entry_notifications is 'Admin notification queue for key events';
