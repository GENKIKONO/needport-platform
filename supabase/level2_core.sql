-- 監査ログ（汎用）
create table if not exists audit_logs(
  id uuid primary key default gen_random_uuid(),
  actor_id text,               -- Clerk userId
  action text not null,        -- e.g. NEED_PUBLISHED / SETTLEMENT_MARK_PAID
  target_type text not null,   -- e.g. need / settlement / contact
  target_id text not null,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_audit_logs_target on audit_logs(target_type, target_id);
create index if not exists idx_audit_logs_actor on audit_logs(actor_id);

-- Webhook去重（既にあればNOOP）
create table if not exists webhook_events(
  id text primary key,         -- Stripe event.id
  type text,
  payload jsonb,
  created_at timestamptz default now()
);

-- user_roles（既存ならNOOP）
create table if not exists user_roles(
  user_id text not null,
  role text not null,
  primary key(user_id, role)
);

-- vendor_profiles（既存ならNOOP） + Connect列（既に追加済でもIF NOT EXISTSで安全）
create table if not exists vendor_profiles(
  user_id text primary key,
  display_name text,
  created_at timestamptz default now()
);
alter table vendor_profiles add column if not exists stripe_connect_account_id text;
alter table vendor_profiles add column if not exists stripe_connect_ready boolean default false;
alter table vendor_profiles add column if not exists stripe_connect_updated_at timestamptz;

create index if not exists idx_vendor_profiles_stripe_account on vendor_profiles(stripe_connect_account_id);
create index if not exists idx_vendor_profiles_connect_ready on vendor_profiles(stripe_connect_ready);

-- project_settlements（既存なら拡張のみ）
create table if not exists project_settlements (
  id uuid primary key default gen_random_uuid(),
  need_id uuid not null,
  vendor_id text not null, -- Clerk user ID
  final_price integer not null check (final_price > 0),
  fee_rate decimal(5,4) not null default 0.1000 check (fee_rate >= 0.01 and fee_rate <= 0.30),
  fee_amount integer not null check (fee_amount > 0),
  method text not null default 'bank_transfer' check (method in ('stripe','bank_transfer')),
  status text not null default 'draft' check (status in ('draft','pending','paid','failed','cancelled')),
  stripe_checkout_session text,
  bank_transfer_ref text,
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_settlements_need on project_settlements(need_id);
create index if not exists idx_settlements_vendor on project_settlements(vendor_id);
create index if not exists idx_settlements_status on project_settlements(status);
create index if not exists idx_settlements_session on project_settlements(stripe_checkout_session);

-- RLS（安全な最小）
alter table project_settlements enable row level security;
do $$ begin
  create policy "Vendor can select own settlements"
  on project_settlements for select
  using (vendor_id = auth.jwt() ->> 'sub');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Vendor can insert own settlements"
  on project_settlements for insert
  with check (vendor_id = auth.jwt() ->> 'sub');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Vendor can update own settlements"
  on project_settlements for update
  using (vendor_id = auth.jwt() ->> 'sub');
exception when duplicate_object then null; end $$;

-- 管理者アクセス（user_roles.role='admin'）
do $$ begin
  create policy "Admin can select all settlements"
  on project_settlements for select
  using (exists (select 1 from user_roles where user_id = auth.jwt()->>'sub' and role='admin'));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admin can update all settlements"
  on project_settlements for update
  using (exists (select 1 from user_roles where user_id = auth.jwt()->>'sub' and role='admin'));
exception when duplicate_object then null; end $$;

-- Needs API 用の軽量化インデックス（既に追加済ならNOOP）
create index if not exists idx_needs_public on needs(public);
create index if not exists idx_needs_region on needs(region);
create index if not exists idx_needs_category on needs(category);
