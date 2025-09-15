-- profiles に clerk_user_id を用意（なければ作成）
alter table public.profiles
add column if not exists clerk_user_id text;

create unique index if not exists profiles_clerk_user_id_key
on public.profiles (clerk_user_id)
where clerk_user_id is not null;

-- "名前や自己紹介など" が NOT NULL なら緩める（存在する列だけ走ります）
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='profiles'
             and column_name='full_name') then
    begin
      alter table public.profiles alter column full_name drop not null;
      alter table public.profiles alter column full_name set default '';
    end;
  end if;
exception when others then null;
end $$;
