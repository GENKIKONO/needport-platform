-- scripts/sql/rls-needs-check.sql
-- RLS policy verification for needs tables
-- Run this in Supabase SQL Editor or via psql

-- Check if RLS is enabled on tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ Enabled'
    ELSE '❌ Disabled'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('needs', 'need_engagements', 'need_anonymous_interest')
ORDER BY tablename;

-- Detailed policy information
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has WHERE clause'
    ELSE 'No WHERE clause'
  END as has_condition,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK'
    ELSE 'No WITH CHECK'
  END as has_check,
  qual as where_clause,
  with_check as check_clause
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('needs', 'need_engagements', 'need_anonymous_interest')
ORDER BY tablename, cmd, policyname;

-- Check for needs table specific requirements
SELECT 
  '=== NEEDS TABLE ANALYSIS ===' as section,
  '' as details
UNION ALL
SELECT 
  'Policy Name' as section,
  policyname as details
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'needs'
  AND cmd = 'SELECT'
  AND (qual LIKE '%published%' OR qual LIKE '%status%')
UNION ALL
SELECT 
  'INSERT Policies' as section,
  COUNT(*)::text || ' policies found'
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'needs'
  AND cmd = 'INSERT';

-- Verify status column constraints
SELECT 
  '=== STATUS COLUMN CONSTRAINTS ===' as section,
  '' as details
UNION ALL
SELECT 
  'Table: ' || t.table_name as section,
  'Column: ' || c.column_name || ' | Type: ' || c.data_type as details
FROM information_schema.tables t
JOIN information_schema.columns c ON c.table_name = t.table_name
WHERE t.table_schema = 'public'
  AND t.table_name = 'needs'
  AND c.column_name = 'status';

-- Check constraint definitions for status field
SELECT 
  '=== CHECK CONSTRAINTS ===' as section,
  conname as constraint_name
FROM pg_constraint 
WHERE conrelid = 'public.needs'::regclass
  AND contype = 'c'
UNION ALL
SELECT 
  'Constraint Definition' as section,
  pg_get_constraintdef(oid) as constraint_def
FROM pg_constraint 
WHERE conrelid = 'public.needs'::regclass
  AND contype = 'c'
  AND conname LIKE '%status%';

-- Summary report
SELECT 
  '=== SECURITY SUMMARY ===' as report_section,
  '' as report_details
UNION ALL
SELECT 
  'Tables with RLS' as report_section,
  COUNT(*)::text || ' out of ' || (
    SELECT COUNT(*) 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('needs', 'need_engagements', 'need_anonymous_interest')
  )::text || ' expected tables'
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('needs', 'need_engagements', 'need_anonymous_interest')
  AND rowsecurity = true
UNION ALL
SELECT 
  'Total Policies' as report_section,
  COUNT(*)::text || ' policies configured'
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('needs', 'need_engagements', 'need_anonymous_interest')
UNION ALL
SELECT 
  'Needs READ Policies' as report_section,
  COUNT(*)::text || ' policies (should be >= 1)'
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'needs'
  AND cmd = 'SELECT'
UNION ALL
SELECT 
  'Needs INSERT Policies' as report_section,
  COUNT(*)::text || ' policies (should be >= 1)'
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'needs'
  AND cmd = 'INSERT';

-- Potential issues detection
SELECT 
  '=== POTENTIAL ISSUES ===' as issue_section,
  '' as issue_details
UNION ALL
SELECT 
  'Issue Type' as issue_section,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ No SELECT policies found for needs table!'
    ELSE '✅ SELECT policies configured'
  END as issue_details
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'needs'
  AND cmd = 'SELECT'
UNION ALL
SELECT 
  'Anonymous INSERT Check' as issue_section,
  CASE 
    WHEN COUNT(*) > 0 THEN '⚠️  Anonymous users can insert - verify this is intended'
    ELSE '✅ Anonymous inserts properly restricted'
  END as issue_details
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'needs'
  AND cmd = 'INSERT'
  AND 'anon' = ANY(roles)
  AND (with_check IS NULL OR with_check = 'true');