-- vendor_accesses: 業者が特定needの連絡先にアクセスできる権利
create table if not exists public.vendor_accesses (
  id uuid primary key default gen_random_uuid(),
  need_id uuid not null,
  stripe_customer_id text not null,
  unlocked_at timestamptz not null default now()
);

-- user_phone_supports: エンドユーザーの電話サポ購読状態
create table if not exists public.user_phone_supports (
  id uuid primary key default gen_random_uuid(),
  stripe_customer_id text unique not null,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- user_identities: ClerkとStripeのひも付け（必要なら）
create table if not exists public.user_identities (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,
  stripe_customer_id text unique
);

-- RLS: ここは最低限（読み出しはサーバー側のみ）。App側はserver-onlyで操作。
alter table public.vendor_accesses enable row level security;
alter table public.user_phone_supports enable row level security;
alter table public.user_identities enable row level security;

-- 例: サーバーロールのみフル操作（Service Role Key使用時）。アプリからはselectも基本しない想定。
drop policy if exists p_vendors_svc_all on public.vendor_accesses;
create policy p_vendors_svc_all on public.vendor_accesses
  for all using (true) with check (true);

drop policy if exists p_phone_supports_svc_all on public.user_phone_supports;
create policy p_phone_supports_svc_all on public.user_phone_supports
  for all using (true) with check (true);

drop policy if exists p_user_identities_svc_all on public.user_identities;
create policy p_user_identities_svc_all on public.user_identities
  for all using (true) with check (true);
