-- vendor_profiles が無ければ作成
create table if not exists vendor_profiles (
  user_id text primary key,
  display_name text,
  created_at timestamptz default now()
);

-- Stripe Connect 用カラム
alter table vendor_profiles add column if not exists stripe_connect_account_id text;
alter table vendor_profiles add column if not exists stripe_connect_ready boolean default false;
alter table vendor_profiles add column if not exists stripe_connect_updated_at timestamptz;

-- インデックス
create index if not exists idx_vendor_profiles_stripe_account on vendor_profiles(stripe_connect_account_id);
create index if not exists idx_vendor_profiles_connect_ready on vendor_profiles(stripe_connect_ready);

-- RLS ポリシー
alter table vendor_profiles enable row level security;

create policy if not exists "Vendors can update own stripe connect" on vendor_profiles
  for update using (user_id = auth.jwt() ->> 'sub')
  with check   (user_id = auth.jwt() ->> 'sub');
