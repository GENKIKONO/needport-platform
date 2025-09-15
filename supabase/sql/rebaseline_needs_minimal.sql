-- Rebaseline needs table for minimal posting flow
-- Purpose: Ensure minimal schema compliance with auto owner_id assignment

-- 必須カラムを保証
alter table public.needs
  add column if not exists status   text    not null default 'draft',
  add column if not exists published boolean not null default false,
  add column if not exists owner_id uuid references public.profiles(id);

-- 既存トリガ/関数を安全に削除
drop trigger if exists set_owner_id_trigger on public.needs;
drop function if exists public.set_owner_id();

-- 挿入時に owner_id を自動付与
create function public.set_owner_id()
returns trigger
language plpgsql
as $$
begin
  new.owner_id := auth.uid()::uuid; -- text→uuid キャスト
  return new;
end;
$$;

create trigger set_owner_id_trigger
before insert on public.needs
for each row execute function public.set_owner_id();

-- RLS 最小化：認証済みなら INSERT 可
alter table public.needs enable row level security;

drop policy if exists needs_insert_policy on public.needs;
create policy needs_insert_policy
on public.needs
for insert
to authenticated
with check (true);

-- PostgREST スキーマキャッシュ更新
notify pgrst, 'reload schema';