create table if not exists user_roles(
  user_id text not null,
  role text not null,
  primary key(user_id, role)
);

-- 自分（Clerk の userId）を admin に
-- 例: 'user_123' を置き換えて実行
insert into user_roles(user_id, role) values ('<YOUR_CLERK_USER_ID>', 'admin')
on conflict (user_id, role) do nothing;
