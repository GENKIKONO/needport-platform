-- 通知テーブル（アプリ内）
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  type text not null, -- 'message','proposal','settlement','system'
  title text not null,
  body text,
  meta jsonb default '{}'::jsonb,
  read boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_notifications_user on notifications(user_id);
create index if not exists idx_notifications_created on notifications(created_at);

-- メールキュー（非同期送信用）
create table if not exists email_queue (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  to_user_id text,
  subject text not null,
  text_body text,
  html_body text,
  template text,         -- 将来テンプレ名で差し替え可
  meta jsonb default '{}'::jsonb,
  status text default 'queued', -- 'queued','sent','error'
  error text,
  created_at timestamptz default now(),
  sent_at timestamptz
);
create index if not exists idx_email_queue_status on email_queue(status);

-- RLS
alter table notifications enable row level security;
alter table email_queue enable row level security;

-- 通知は本人のみ参照可能（adminは別途ビューで運用想定）
create policy if not exists "Users can read own notifications" on notifications
  for select using (user_id = auth.jwt() ->> 'sub');

-- 受信者本人 or 管理ジョブ（サービスロール）で操作（ここではサービスロールで送信更新を想定）
create policy if not exists "Service role manage email_queue" on email_queue
  for all to service_role using (true) with check (true);
