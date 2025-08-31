-- 1. needs に縦ライン／開示ポリシー／5W1H項目を追加
alter table needs add column if not exists kind text default 'default' check (kind in ('default','care_taxi'));
alter table needs add column if not exists user_reveal_policy text default 'paid' check (user_reveal_policy in ('paid','accepted'));
alter table needs add column if not exists vendor_visibility text default 'anonymous' check (vendor_visibility in ('anonymous','public'));

-- 5W1H（care_taxi向け簡易投稿）
alter table needs add column if not exists when_date date;               -- いつ
alter table needs add column if not exists when_time time;               -- いつ（時間）
alter table needs add column if not exists where_from text;              -- どこから
alter table needs add column if not exists where_to text;                -- どこへ
alter table needs add column if not exists who_count int;                -- 誰（人数）
alter table needs add column if not exists wheelchair boolean;           -- 車椅子の有無
alter table needs add column if not exists helpers_needed int;           -- 介助人数の希望
alter table needs add column if not exists notes text;                   -- 備考（短文）

-- 公開ビュー（care_taxiは住所系を強めにマスク）
create or replace view needs_public_v as
select
  id, title, summary,
  kind, user_reveal_policy, vendor_visibility,
  region, category, created_at, updated_at, deadline,
  -- 住所/出発到着はマスク（末尾伏字）
  case when kind='care_taxi' then regexp_replace(where_from, '(.{3}).*', '\1●●●') else where_from end as where_from_masked,
  case when kind='care_taxi' then regexp_replace(where_to,   '(.{3}).*', '\1●●●') else where_to   end as where_to_masked,
  when_date, when_time,
  who_count, wheelchair, helpers_needed,
  -- 既存PIIのマスク（あれば）
  true as pii_masked
from needs
where status = 'published';

-- 2. vendor_profiles を公開プロフィール対応
alter table vendor_profiles add column if not exists public_name text;
alter table vendor_profiles add column if not exists public_areas text;      -- 対応エリア
alter table vendor_profiles add column if not exists license_no text;        -- 許可/免許番号
alter table vendor_profiles add column if not exists website text;
alter table vendor_profiles add column if not exists avatar_url text;
alter table vendor_profiles add column if not exists categories text[];      -- ['care_taxi',...]

-- care_taxi 向きのベンダー一覧ビュー
create or replace view vendors_public_care_taxi_v as
select user_id, coalesce(public_name, display_name) as name, avatar_url, public_areas, license_no, website
from vendor_profiles
where categories && array['care_taxi'];

-- 3. proposals / messages の開示条件を示すマテビュー的メタ（メモ用：実ロジックはAPIで判定）
--   - default: userは paid で開示、vendorは匿名
--   - care_taxi: vendorは常に公開、userは accepted で開示
-- 既存テーブルとRLSはそのまま。API側で kind / policy を見て返却するフィールドを制御。

-- 4. 監査／承認は既存の audit_logs ／ admin queues を継続利用
