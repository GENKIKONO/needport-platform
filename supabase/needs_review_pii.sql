-- needs テーブルに承認フロー & PII列を安全に追加
-- 既に存在しても IF NOT EXISTS / duplicate_object ガードで安全に進む
do $$ begin
  alter table needs add column if not exists status text not null default 'draft' check (status in ('draft','review','published'));
exception when undefined_table then null; end $$;

do $$ begin
  alter table needs add column if not exists pii_phone text;
  alter table needs add column if not exists pii_email text;
  alter table needs add column if not exists pii_address text;
  alter table needs add column if not exists pii_masked_fields text[] default array[]::text[];
exception when undefined_table then null; end $$;

-- PII マスク関数：権限に応じて安全に伏字を返す
create or replace function mask_pii(value text) returns text language sql immutable as $$
  select case
    when value is null then null
    else
      -- 先頭と末尾を残して中間を●化（長さに応じて調整）
      case
        when length(value) <= 2 then repeat('●', greatest(length(value),1))
        when length(value) <= 6 then left(value,1) || repeat('●', length(value)-2) || right(value,1)
        else left(value,2) || repeat('●', greatest(length(value)-4,1)) || right(value,2)
      end
  end;
$$;

-- 「このユーザーは PII を見て良いか？」を判定する関数
-- 条件：管理者 or （将来）vendor_access に該当 or （将来）有効サブスク
-- いまは admin のみ true（Stripe導線OFF中のため）
create or replace function can_view_pii(needs_row needs, viewer_id text) returns boolean language plpgsql as $$
declare _is_admin boolean;
begin
  if viewer_id is null then
    return false;
  end if;

  -- 管理者判定
  select exists(
    select 1 from user_roles
    where user_id = viewer_id and role = 'admin'
  ) into _is_admin;

  if _is_admin then
    return true;
  end if;

  -- TODO: vendor_access / サブスクロジックは Stripe ON 後にここへ追加
  return false;
end;
$$;

-- 公開ビュー：published のみ返し、閲覧者権限で PII をマスク
drop view if exists needs_public cascade;
create view needs_public as
select
  n.id,
  n.title,
  n.summary,
  n.region,
  n.category,
  n.created_at,
  n.updated_at,
  n.deadline,
  n.status,
  -- 表示用の PII（閲覧者権限で自動マスク）
  case when can_view_pii(n, null) then n.pii_phone else mask_pii(n.pii_phone) end as pii_phone_masked,
  case when can_view_pii(n, null) then n.pii_email else mask_pii(n.pii_email) end as pii_email_masked,
  case when can_view_pii(n, null) then n.pii_address else mask_pii(n.pii_address) end as pii_address_masked
from needs n
where n.status = 'published';

-- RLS：needs 本体は作成者 or 管理者のみ更新／削除可
alter table needs enable row level security;

do $$ begin
  create policy "Needs read all rows" on needs
    for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Needs insert by owner" on needs
    for insert with check (auth.jwt()->>'sub' = coalesce(creator_id::text, auth.jwt()->>'sub'));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Needs update by owner or admin" on needs
    for update using (
      (creator_id::text = auth.jwt()->>'sub')
      or exists(select 1 from user_roles where user_id = auth.jwt()->>'sub' and role='admin')
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Needs delete by owner or admin" on needs
    for delete using (
      (creator_id::text = auth.jwt()->>'sub')
      or exists(select 1 from user_roles where user_id = auth.jwt()->>'sub' and role='admin')
    );
exception when duplicate_object then null; end $$;

-- 承認フロー運用インデックス
create index if not exists idx_needs_status on needs(status);
