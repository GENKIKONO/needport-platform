-- Smoke テストデータの掃除（24時間以上前のデータ）
-- 運用時に Supabase SQL Editor で実行、またはスケジュールタスクに登録

delete from public.needs
where title like 'Smoke:%' 
  and created_at < now() - interval '24 hours';

-- 削除件数を確認
select 
  count(*) as deleted_count,
  'Smoke test data older than 24 hours' as description
from public.needs
where title like 'Smoke:%' 
  and created_at < now() - interval '24 hours';
