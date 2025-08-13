-- Entry notifications table for email pipeline
-- Tracks notification status for new entries

create table if not exists public.entry_notifications (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.entries(id) on delete cascade,
  status text not null check(status in ('queued','sent','failed')),
  created_at timestamptz default now(),
  error text
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

-- Function to queue notification
create or replace function public.fn_queue_entry_notification()
returns trigger as $$
begin
  insert into public.entry_notifications (entry_id, status)
  values (NEW.id, 'queued');
  return NEW;
end;
$$ language plpgsql security definer;

-- Trigger to automatically queue notifications
drop trigger if exists trigger_queue_entry_notification on public.entries;
create trigger trigger_queue_entry_notification
  after insert on public.entries
  for each row
  execute function public.fn_queue_entry_notification();

-- Add indexes for performance
create index if not exists idx_entry_notifications_status on public.entry_notifications(status);
create index if not exists idx_entry_notifications_created_at on public.entry_notifications(created_at);

-- Add comment for documentation
comment on table public.entry_notifications is 'Email notification queue for new entries';
