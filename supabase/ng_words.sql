-- NGワード辞書
create table if not exists ng_words (
  id uuid primary key default gen_random_uuid(),
  pattern text not null,             -- 検索パターン（文字列 or 正規表現）
  is_regex boolean not null default false,
  severity text not null default 'medium' check (severity in ('low','medium','high')),
  enabled boolean not null default true,
  notes text,
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_ng_words_enabled on ng_words(enabled);
create index if not exists idx_ng_words_severity on ng_words(severity);

-- 監査（簡易）
create table if not exists ng_match_logs (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('need','message')),
  target_id uuid not null,
  matches jsonb not null,            -- [{pattern, severity, indices:[{start,end}], excerpt}]
  created_at timestamptz default now(),
  created_by text
);

-- RLS
alter table ng_words enable row level security;
alter table ng_match_logs enable row level security;

-- adminのみ閲覧/更新
create policy if not exists "admins read ng_words" on ng_words
  for select using (exists (select 1 from user_roles where user_id=auth.jwt()->>'sub' and role='admin'));
create policy if not exists "admins write ng_words" on ng_words
  for insert with check (exists (select 1 from user_roles where user_id=auth.jwt()->>'sub' and role='admin'));
create policy if not exists "admins write2 ng_words" on ng_words
  for update using (exists (select 1 from user_roles where user_id=auth.jwt()->>'sub' and role='admin'));
create policy if not exists "admins del ng_words" on ng_words
  for delete using (exists (select 1 from user_roles where user_id=auth.jwt()->>'sub' and role='admin'));

create policy if not exists "admins read ng_match_logs" on ng_match_logs
  for select using (exists (select 1 from user_roles where user_id=auth.jwt()->>'sub' and role='admin'));
create policy if not exists "admins insert ng_match_logs" on ng_match_logs
  for insert with check (exists (select 1 from user_roles where user_id=auth.jwt()->>'sub' and role='admin'));
