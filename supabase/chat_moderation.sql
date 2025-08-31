-- 1) 提案メッセージにステータスを追加（pending/approved/rejected）
alter table proposal_messages
  add column if not exists status text
  check (status in ('pending','approved','rejected'))
  default 'pending';

-- 2) 既存行の初期化（なければ承認済み扱いに寄せたい場合は 'approved'、厳格にするなら 'pending'）
update proposal_messages set status = coalesce(status, 'pending');

-- 3) 公開ビュー：参加者に見せるのは approved のみ
create or replace view v_proposal_messages_visible as
select *
from proposal_messages
where status = 'approved';

-- 4) RLS：読み取りは
--   a) 参加者は approved のみ閲覧可（v_proposal_messages_visible を使う側で担保）
--   b) 送信者は自分の pending/rejected も見える（「送信済みだが審査待ち/却下」を把握できる）
--   c) 管理者は全件可
-- ※ 元テーブルのRLS方針がある前提。足りない場合は以下を追加。
-- 送信者=auth.jwt()->>'sub' が sender_id の場合は SELECT 可
create policy if not exists "Sender can read own messages (any status)" on proposal_messages
  for select using (sender_id = auth.jwt() ->> 'sub');

-- 管理者は全件 SELECT 可
create policy if not exists "Admins can read all messages" on proposal_messages
  for select using (
    exists (select 1 from user_roles where user_id = auth.jwt() ->> 'sub' and role = 'admin')
  );

-- 5) 参加者向けAPIでは v_proposal_messages_visible を使うため、現行RLSと両立する
-- 6) 管理承認APIからのみ status を変更可能（UPDATE）
create policy if not exists "Admins can moderate messages" on proposal_messages
  for update using (
    exists (select 1 from user_roles where user_id = auth.jwt() ->> 'sub' and role = 'admin')
  );
