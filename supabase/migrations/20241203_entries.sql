-- Entries table for public recruitment
-- Allows users to submit entry applications for adopted needs

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  need_id uuid not null references public.needs(id) on delete cascade,
  name text not null,
  email text not null,
  count integer not null check (count > 0),
  note text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.entries enable row level security;

-- Policy: allow INSERT for anon only when the target need is accepting entries
create policy "Allow insert entries for adopted needs" on public.entries
  for insert to anon
  with check (
    exists(
      select 1 from public.needs n 
      where n.id = entries.need_id 
        and n.adopted_offer_id is not null
        and (n.deadline is null or n.deadline >= now())
        and n.recruitment_closed = false
    )
  );

-- Block SELECT/UPDATE/DELETE for anon
create policy "Block all operations for anon" on public.entries
  for all to anon
  using (false)
  with check (false);

-- Add indexes for performance
create index if not exists idx_entries_need_id on public.entries(need_id);
create index if not exists idx_entries_created_at on public.entries(created_at desc);

-- Add comment for documentation
comment on table public.entries is 'Public entry applications for adopted needs';
