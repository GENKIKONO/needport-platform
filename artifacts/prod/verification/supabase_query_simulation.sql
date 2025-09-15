-- Supabase確認クエリ（手動実行用）
-- 実行時刻: 2025-09-15T04:57

-- 1. 最近の投稿確認（1時間以内）
select 
    id, 
    title,
    status, 
    published, 
    owner_id,
    created_at,
    CASE 
        WHEN owner_id IS NOT NULL THEN '✅ owner_id設定済み'
        ELSE '❌ owner_id未設定'
    END as owner_status
from needs
where title like '%E2E%' 
   or title like '%LIVE%'
   or title like '%Auto-provision%'
   or created_at > now() - interval '1 hour'
order by created_at desc 
limit 5;

-- 2. プロファイル確認
select 
    id,
    clerk_user_id,
    email,
    full_name,
    role,
    created_at
from profiles
where created_at > now() - interval '1 hour'
   or email like '%needport%'
order by created_at desc;

-- 3. スキーマ確認
select 
    table_name,
    column_name,
    data_type,
    is_nullable
from information_schema.columns
where table_name in ('profiles', 'needs')
  and column_name in ('owner_id', 'clerk_user_id', 'email', 'status')
order by table_name, column_name;

-- 4. RLSポリシー確認
select 
    schemaname,
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN '✅ ポリシー有効'
        ELSE '⚠️ ポリシー無効'
    END as policy_status
from pg_policies 
where tablename in ('needs', 'profiles')
order by tablename, policyname;