-- プロポーザル（提案）
create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  need_id uuid not null references needs(id) on delete cascade,
  vendor_id text not null,                 -- Clerk user id
  title text not null check (length(title) between 3 and 160),
  body text not null check (length(body) between 10 and 4000),
  estimate_price integer check (estimate_price >= 0), -- 見積もり（任意）
  status text not null default 'sent' check (status in ('sent','accepted','declined','withdrawn')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 履歴が見やすいように
create index if not exists idx_proposals_need on proposals(need_id, created_at desc);
create index if not exists idx_proposals_vendor on proposals(vendor_id, created_at desc);
create index if not exists idx_proposals_status on proposals(status);

-- RLS
alter table proposals enable row level security;

-- 閲覧ポリシー：
-- 1) 公開ページでは、need_id が published のニーズに紐づく proposals は「枚数のみ」公開予定（API側で集計）
-- 2) 実データの閲覧は、提案者本人 or 管理者のみ
do $$ begin
  create policy "Proposals: read own or admin" on proposals
    for select using (
      vendor_id = auth.jwt()->>'sub' OR
      exists(select 1 from user_roles where user_id = auth.jwt()->>'sub' and role = 'admin')
    );
exception when duplicate_object then null; end $$;

-- 作成ポリシー：本人のみ
do $$ begin
  create policy "Proposals: insert by self" on proposals
    for insert with check (vendor_id = auth.jwt()->>'sub');
exception when duplicate_object then null; end $$;

-- 更新ポリシー：本人 or 管理者（例：withdrawn, accepted/declined は後で運用UIから）
do $$ begin
  create policy "Proposals: update by self or admin" on proposals
    for update using (
      vendor_id = auth.jwt()->>'sub' OR
      exists(select 1 from user_roles where user_id = auth.jwt()->>'sub' and role = 'admin')
    );
exception when duplicate_object then null; end $$;

-- 監査ログ（トリガー）
create table if not exists audit_logs (
  id bigserial primary key,
  actor_id text,
  action text not null,
  target_type text not null,
  target_id text not null,
  meta jsonb,
  created_at timestamptz default now()
);

create or replace function trg_proposals_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists t_proposals_updated_at on proposals;
create trigger t_proposals_updated_at before update on proposals
for each row execute procedure trg_proposals_updated_at();
