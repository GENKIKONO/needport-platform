-- 業種マスタ
create table if not exists industries (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,          -- 例: 'care_taxi'
  name text not null,                 -- 表示名: '介護タクシー'
  fee_applicable boolean not null default true,  -- 成果報酬対象か
  description text,
  sort_order int default 100,
  enabled boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ベンダーと業種の多対多
create table if not exists vendor_industries (
  vendor_id text not null,            -- Clerk user id
  industry_id uuid not null references industries(id) on delete cascade,
  primary key(vendor_id, industry_id),
  created_at timestamptz default now()
);

-- needs に industry_id を持たせる（任意）
alter table needs add column if not exists industry_id uuid references industries(id);

-- 代表業種の公開ビュー（ディレクトリ用）
create or replace view vendors_directory_v as
select
  vp.user_id,
  coalesce(vp.public_name, vp.display_name) as name,
  vp.avatar_url,
  vp.public_areas,
  vp.website,
  array_agg(i.name order by i.sort_order) filter (where i.enabled) as industries,
  bool_or(not i.fee_applicable) filter (where i.enabled) as any_fee_blocked
from vendor_profiles vp
left join vendor_industries vi on vi.vendor_id = vp.user_id
left join industries i on i.id = vi.industry_id and i.enabled
group by vp.user_id, vp.public_name, vp.display_name, vp.avatar_url, vp.public_areas, vp.website;

-- RLS（参考：vendor_profiles に合わせて運用；公開ビューは誰でもSELECT可）
-- industries / vendor_industries は admin API 経由で操作する前提

-- 初期データ（必要なら）
insert into industries (slug, name, fee_applicable, description, sort_order)
values
  ('care_taxi','介護タクシー', false, '成果報酬は対象外。公開プロフィール＋承認→情報開示で運用。', 10)
on conflict (slug) do nothing;
