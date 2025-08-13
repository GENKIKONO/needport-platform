-- Attachments table for file uploads
-- Stores metadata for files uploaded to Supabase Storage

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  need_id uuid references public.needs(id) on delete cascade,
  entry_id uuid references public.entries(id) on delete cascade,
  file_path text not null,
  file_name text,
  size integer,
  content_type text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.attachments enable row level security;

-- Block all operations for anon (admin only)
create policy "Block all operations for anon" on public.attachments
  for all to anon
  using (false)
  with check (false);

-- Allow all operations for authenticated users (admin)
create policy "Allow all operations for authenticated users" on public.attachments
  for all to authenticated
  using (true)
  with check (true);

-- Add indexes for performance
create index if not exists idx_attachments_need_id on public.attachments(need_id);
create index if not exists idx_attachments_entry_id on public.attachments(entry_id);
create index if not exists idx_attachments_created_at on public.attachments(created_at desc);

-- Add comment for documentation
comment on table public.attachments is 'File attachments for needs and entries';
