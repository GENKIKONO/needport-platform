-- Post-Deployment Testing Queries
-- Execute these queries after Vercel deployment to verify auto-provisioning works
-- Date: 2025-09-15

-- ============================================================================
-- Pre-Test Verification
-- ============================================================================

-- 1. Check current state of profiles table
SELECT 
  '📊 Current Profiles State' as check_section,
  id,
  clerk_user_id,
  email,
  full_name,
  role,
  created_at
FROM profiles 
WHERE email LIKE '%genkikono%' OR email = 'test@needport.dev'
ORDER BY created_at DESC;

-- 2. Check current state of needs table
SELECT 
  '📋 Current Needs State' as check_section,
  id,
  title,
  owner_id,
  status,
  published,
  created_at,
  (SELECT email FROM profiles WHERE id = needs.owner_id) as owner_email
FROM needs 
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- Post /needs/new Test Verification Queries
-- ============================================================================

-- After posting via /needs/new, run these queries to verify:

-- 3. Verify new need was created with proper owner_id
-- Run this AFTER posting a test need via the UI
SELECT 
  '🎯 Latest Need Verification' as check_section,
  n.id,
  n.title,
  n.owner_id,
  n.status,
  n.published,
  n.created_at,
  p.email as owner_email,
  p.full_name as owner_name,
  p.clerk_user_id as owner_clerk_id,
  CASE 
    WHEN n.owner_id IS NOT NULL THEN '✅ owner_id is set'
    ELSE '❌ owner_id is NULL'
  END as owner_id_status,
  CASE 
    WHEN n.status = 'draft' THEN '✅ status is draft'
    ELSE '❌ status is not draft'
  END as status_check,
  CASE 
    WHEN n.published = false THEN '✅ published is false'
    ELSE '❌ published is not false'
  END as published_check
FROM needs n
LEFT JOIN profiles p ON p.id = n.owner_id
WHERE n.created_at > NOW() - INTERVAL '10 minutes'
ORDER BY n.created_at DESC
LIMIT 5;

-- 4. Verify profile was auto-created if it didn't exist
-- This shows if ensureProfile() worked correctly
SELECT 
  '👤 Profile Auto-Creation Check' as check_section,
  clerk_user_id,
  email,
  full_name,
  role,
  created_at,
  CASE 
    WHEN created_at > NOW() - INTERVAL '10 minutes' THEN '🆕 Recently created (likely auto-provisioned)'
    ELSE '📅 Existing profile'
  END as creation_status
FROM profiles 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- 5. Check RLS policy enforcement
-- This should only show needs where you are the owner (based on Clerk auth)
SELECT 
  '🔒 RLS Policy Test' as check_section,
  n.id,
  n.title,
  n.owner_id,
  p.email as owner_email,
  'If you see this, RLS is working - you can only see your own needs' as rls_status
FROM needs n
JOIN profiles p ON p.id = n.owner_id
WHERE n.created_at > NOW() - INTERVAL '1 day';

-- ============================================================================
-- Health Check Queries
-- ============================================================================

-- 6. Overall system health check
SELECT 
  '🏥 System Health Check' as check_section,
  (SELECT COUNT(*) FROM profiles WHERE clerk_user_id IS NOT NULL) as profiles_with_clerk_id,
  (SELECT COUNT(*) FROM needs WHERE owner_id IS NOT NULL) as needs_with_owner,
  (SELECT COUNT(*) FROM needs WHERE status IN ('draft', 'published', 'closed')) as needs_with_valid_status,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'needs') as needs_rls_policies;

-- 7. Recent activity summary
SELECT 
  '📈 Recent Activity (Last 24h)' as check_section,
  COUNT(*) as total_needs,
  COUNT(*) FILTER (WHERE owner_id IS NOT NULL) as needs_with_owner,
  COUNT(*) FILTER (WHERE status = 'draft') as draft_needs,
  COUNT(*) FILTER (WHERE status = 'published') as published_needs,
  COUNT(DISTINCT owner_id) as unique_owners
FROM needs 
WHERE created_at > NOW() - INTERVAL '24 hours';

-- ============================================================================
-- Debugging Queries (if issues occur)
-- ============================================================================

-- 8. Debug: Check for needs without owner_id (should be empty after migration)
SELECT 
  '🐛 Debug: Needs without owner_id' as debug_section,
  id,
  title,
  created_by,
  created_at,
  'This should be empty after migration' as note
FROM needs 
WHERE owner_id IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- 9. Debug: Check for profiles without clerk_user_id (should only be legacy data)
SELECT 
  '🐛 Debug: Profiles without clerk_user_id' as debug_section,
  id,
  email,
  full_name,
  created_at,
  'These might be legacy profiles' as note
FROM profiles 
WHERE clerk_user_id IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- 10. Debug: Check RLS policies are active
SELECT 
  '🐛 Debug: RLS Policies Status' as debug_section,
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'needs') as policy_count
FROM pg_tables 
WHERE tablename = 'needs';

-- ============================================================================
-- Expected Results Summary
-- ============================================================================

/*
Expected Results After Successful Deployment & Testing:

1. ✅ Latest Need Verification should show:
   - owner_id is NOT NULL
   - status = 'draft' 
   - published = false
   - owner_email matches the logged-in user

2. ✅ Profile Auto-Creation Check should show:
   - Either existing profile OR newly created profile
   - clerk_user_id matches the Clerk user
   - email and full_name populated

3. ✅ System Health Check should show:
   - profiles_with_clerk_id > 0
   - needs_with_owner >= needs count
   - needs_rls_policies = 4 (the policies we created)

4. ❌ Debug queries should show:
   - No needs without owner_id (except very old data)
   - RLS enabled on needs table
   - 4 RLS policies active

If any of these fail, check:
- Migration was applied correctly
- Clerk authentication is working
- ensureProfile() function is being called
- RLS policies are active
*/