-- お問い合わせテーブル
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  email text,
  name text,
  subject text,
  body text not null,
  ua text,
  ip text,
  created_at timestamptz default now()
);

-- RLS
alter table contact_messages enable row level security;

-- だれでも INSERT 可（Turnstileでサーバ側検証する前提）
create policy "Anyone can insert contact" on contact_messages
  for insert to public with check (true);

-- 管理者だけ SELECT
create table if not exists user_roles(
  user_id text not null,
  role text not null,
  primary key(user_id, role)
);

create policy "Admins can select contacts" on contact_messages
  for select using (
    exists (
      select 1 from user_roles
      where user_id = auth.jwt() ->> 'sub' and role = 'admin'
    )
  );
