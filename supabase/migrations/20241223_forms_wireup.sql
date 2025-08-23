-- vendors: 事業者プロフィール（公開は一部）
create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  company_name text not null,
  kana text,
  prefecture text,
  website text,
  contact_email text,
  phone text,
  representative text,
  description text,
  capabilities jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_vendors_owner on vendors(owner_id);

-- drafts: サーバ側下書き
create table if not exists drafts (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('need','vendor')),
  owner_id uuid not null,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
create index if not exists idx_drafts_owner on drafts(owner_id);

-- pending_uploads: 添付の一時置き場（後でattachmentsへ昇格）
create table if not exists pending_uploads (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  kind text not null check (kind in ('need','vendor')),
  file_key text not null,
  mime text,
  size int,
  created_at timestamptz not null default now()
);
create index if not exists idx_pending_uploads_owner on pending_uploads(owner_id);

-- vendor_reviews: 事業者審査キュー
create table if not exists vendor_reviews (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  note text,
  reviewed_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_vendor_reviews_status on vendor_reviews(status);

-- RLS
alter table vendors enable row level security;
alter table drafts enable row level security;
alter table pending_uploads enable row level security;
alter table vendor_reviews enable row level security;

-- vendors: owner はCRUD、他者は公開フィールドのみread
drop policy if exists vendors_owner_rw on vendors;
drop policy if exists vendors_public_read on vendors;

create policy vendors_owner_rw on vendors
for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy vendors_public_read on vendors
for select using (true); -- アプリ側でselect列を制御（メール/電話はAPIでマスク）

-- drafts: ownerのみ
drop policy if exists drafts_owner_rw on drafts;
create policy drafts_owner_rw on drafts
for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- pending_uploads: ownerのみ
drop policy if exists pending_uploads_owner_rw on pending_uploads;
create policy pending_uploads_owner_rw on pending_uploads
for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- vendor_reviews: adminのみ（アプリ側でrole判定、DBはselect可にしない）
drop policy if exists vendor_reviews_admin on vendor_reviews;
create policy vendor_reviews_admin on vendor_reviews
for select using (false);
