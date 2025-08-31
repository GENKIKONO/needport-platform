create table if not exists notification_prefs (
  user_id text primary key,
  email_on_message boolean default true,
  email_on_proposal boolean default true,
  email_on_settlement boolean default true,
  updated_at timestamptz default now()
);

alter table notification_prefs enable row level security;

create policy if not exists "Users manage own prefs" on notification_prefs
  for all using (user_id = auth.jwt() ->> 'sub')
  with check (user_id = auth.jwt() ->> 'sub');
