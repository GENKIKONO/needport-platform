alter table proposals add column if not exists locked boolean not null default false;
-- 監査メモの格納先（存在しない場合のみ）
alter table proposal_messages add column if not exists audit_note text;
