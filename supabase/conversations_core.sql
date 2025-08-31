-- メッセージ（提案にぶら下がる1対1）
create table if not exists proposal_messages (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references proposals(id) on delete cascade,
  sender_id text not null,      -- Clerk user id
  body text not null check (length(body) between 1 and 4000),
  created_at timestamptz default now(),
  read_by jsonb default '[]'::jsonb -- 既読者の配列（user_idのJSON配列）
);

-- 高速化
create index if not exists idx_msg_proposal on proposal_messages(proposal_id, created_at);
create index if not exists idx_msg_sender on proposal_messages(sender_id, created_at);

-- 参加者判定ビュー（vendor と need 投稿者を参加者にする）
create or replace view proposal_participants as
select
  p.id as proposal_id,
  p.vendor_id as vendor_id,
  n.owner_id as owner_id  -- needs テーブルに投稿者（owner_id）がある想定。無ければ後で拡張。
from proposals p
join needs n on n.id = p.need_id;

-- RLS
alter table proposal_messages enable row level security;

-- 閲覧：提案の参加者（vendor または need owner）か admin のみ
do $$ begin
  create policy "Messages: select by participants or admin" on proposal_messages
    for select using (
      exists (
        select 1 from proposal_participants pp
        where pp.proposal_id = proposal_messages.proposal_id
          and (pp.vendor_id = auth.jwt()->>'sub' or pp.owner_id = auth.jwt()->>'sub')
      )
      or exists (select 1 from user_roles where user_id = auth.jwt()->>'sub' and role='admin')
    );
exception when duplicate_object then null; end $$;

-- 送信：sender が参加者か admin
do $$ begin
  create policy "Messages: insert by participants or admin" on proposal_messages
    for insert with check (
      exists (
        select 1 from proposal_participants pp
        where pp.proposal_id = proposal_id
          and (pp.vendor_id = auth.jwt()->>'sub' or pp.owner_id = auth.jwt()->>'sub')
      )
      or exists (select 1 from user_roles where user_id = auth.jwt()->>'sub' and role='admin')
    );
exception when duplicate_object then null; end $$;

-- 既読更新（UPDATE）：参加者のみ（admin可）
do $$ begin
  create policy "Messages: update read_by by participants or admin" on proposal_messages
    for update using (
      exists (
        select 1 from proposal_participants pp
        where pp.proposal_id = proposal_messages.proposal_id
          and (pp.vendor_id = auth.jwt()->>'sub' or pp.owner_id = auth.jwt()->>'sub')
      )
      or exists (select 1 from user_roles where user_id = auth.jwt()->>'sub' and role='admin')
    );
exception when duplicate_object then null; end $$;

-- updated_at 的な運用は不要（読み取りは created_at ソート）
-- 監査ログ（送信時）: 既に audit_logs がある前提。API側でINSERTします。
