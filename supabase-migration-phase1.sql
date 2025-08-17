-- Phase-1: 提案→承認→ルーム→マイルストーン 用テーブル群
-- Supabase SQL エディタで実行してください

-- offers（提案）
create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  need_id text not null,
  provider_handle text not null,
  price_yen int,
  memo text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- rooms（案件ルーム）
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  need_id text not null,
  offer_id uuid not null,
  title text,
  created_at timestamptz default now()
);

-- room_members（参加者）
create table if not exists room_members (
  room_id uuid not null,
  user_ref text not null,
  role text not null check (role in ('buyer','vendor','ops')),
  approved boolean default false,
  primary key(room_id, user_ref)
);

-- messages（チャット）
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null,
  user_ref text not null,
  body text not null,
  created_at timestamptz default now()
);

-- milestones（マイルストーン）
create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null,
  title text not null,
  due_date date,
  amount_yen int,
  status text default 'planned'
);

-- パフォーマンス用インデックス
create index if not exists idx_offers_need on offers(need_id);
create index if not exists idx_rooms_need on rooms(need_id);
create index if not exists idx_msgs_room on messages(room_id, created_at desc);
create index if not exists idx_milestones_room on milestones(room_id);

-- 確認用クエリ
select 
  'offers' as table_name, count(*) as row_count 
from offers
union all
select 'rooms', count(*) from rooms
union all
select 'room_members', count(*) from room_members
union all
select 'messages', count(*) from messages
union all
select 'milestones', count(*) from milestones;
