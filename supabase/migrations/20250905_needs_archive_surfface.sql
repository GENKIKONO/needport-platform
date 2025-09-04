-- id等は既存前提。なければ適宜合わせること
alter table needs
  add column if not exists status text check (status in ('active','archived','completed')) default 'active',
  add column if not exists archived_at timestamp with time zone,
  add column if not exists surfaced_at timestamp with time zone,
  add column if not exists surfaced_until timestamp with time zone,
  add column if not exists float_score integer default 0,
  add column if not exists last_activity_at timestamp with time zone;
create index if not exists idx_needs_status_surfaced on needs(status, surfaced_at desc);
create index if not exists idx_needs_float on needs(status, float_score desc, last_activity_at desc);