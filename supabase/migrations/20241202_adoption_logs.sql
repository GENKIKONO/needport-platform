-- Adoption logs table for audit trail
-- Tracks when offers are adopted or unadopted

create table if not exists public.adoption_logs (
  id uuid primary key default gen_random_uuid(),
  need_id uuid not null references public.needs(id) on delete cascade,
  offer_id uuid null references public.offers(id) on delete set null,
  action text not null check (action in ('ADOPT','UNADOPT')),
  actor text not null default 'admin',
  created_at timestamptz default now()
);

-- Add indexes for performance
create index if not exists idx_adoption_logs_need_id on public.adoption_logs(need_id);
create index if not exists idx_adoption_logs_created_at on public.adoption_logs(created_at desc);

-- Add comment for documentation
comment on table public.adoption_logs is 'Audit trail for offer adoption/unadoption actions';
