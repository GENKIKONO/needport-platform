-- Admin audit logs table
-- Tracks all admin actions for audit purposes

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  need_id uuid references public.needs(id) on delete set null,
  offer_id uuid references public.offers(id) on delete set null,
  payload jsonb,
  created_at timestamptz default now()
);

-- No RLS (admin only via service role)
alter table public.admin_audit_logs disable row level security;

-- Add indexes for performance
create index if not exists idx_admin_audit_logs_action on public.admin_audit_logs(action);
create index if not exists idx_admin_audit_logs_need_id on public.admin_audit_logs(need_id);
create index if not exists idx_admin_audit_logs_created_at on public.admin_audit_logs(created_at desc);

-- Add comment for documentation
comment on table public.admin_audit_logs is 'Audit trail for all admin actions';
