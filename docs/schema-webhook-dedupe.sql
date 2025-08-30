create table if not exists public.webhook_events (
  id text primary key,
  received_at timestamptz not null default now()
);

-- RLSはservice role前提で操作するため緩め（必要に応じて調整）
alter table public.webhook_events enable row level security;
drop policy if exists p_webhooks_svc_all on public.webhook_events;
create policy p_webhooks_svc_all on public.webhook_events for all using (true) with check (true);
