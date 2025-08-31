-- 既存: approval_actions がある前提。なければ簡易作成
create table if not exists approval_actions(
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('need','message')),
  target_id uuid not null,
  action text not null check (action in ('approve','reject','send_back')),
  reason_text text,
  template_id uuid,
  meta jsonb,
  created_by text,
  created_at timestamptz default now()
);

-- 却下テンプレ
create table if not exists approval_reason_templates(
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('need','message')),
  title text not null,            -- 例: 「個人情報が含まれています」
  body text not null,             -- 例: 「電話・メール・住所などは…伏字で」
  severity text not null default 'medium' check (severity in ('low','medium','high')),
  enabled boolean not null default true,
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_approval_reason_templates_kind on approval_reason_templates(kind);
create index if not exists idx_approval_reason_templates_enabled on approval_reason_templates(enabled);

-- RLS
alter table approval_actions enable row level security;
alter table approval_reason_templates enable row level security;

-- adminのみ参照/更新
create policy if not exists "admins read approval_actions" on approval_actions
  for select using (exists (select 1 from user_roles where user_id=auth.jwt()->>'sub' and role='admin'));
create policy if not exists "admins insert approval_actions" on approval_actions
  for insert with check (exists (select 1 from user_roles where user_id=auth.jwt()->>'sub' and role='admin'));

create policy if not exists "admins read approval_reason_templates" on approval_reason_templates
  for select using (exists (select 1 from user_roles where user_id=auth.jwt()->>'sub' and role='admin'));
create policy if not exists "admins write approval_reason_templates" on approval_reason_templates
  for insert with check (exists (select 1 from user_roles where user_id=auth.jwt()->>'sub' and role='admin'));
create policy if not exists "admins write2 approval_reason_templates" on approval_reason_templates
  for update using (exists (select 1 from user_roles where user_id=auth.jwt()->>'sub' and role='admin'));
create policy if not exists "admins del approval_reason_templates" on approval_reason_templates
  for delete using (exists (select 1 from user_roles where user_id=auth.jwt()->>'sub' and role='admin'));
