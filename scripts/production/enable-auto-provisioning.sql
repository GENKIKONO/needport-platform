-- Production Auto-Provisioning Enablement Script
-- Execute this in Supabase SQL Editor for production environment
-- Date: 2025-09-15

-- ============================================================================
-- Step 1: Apply migration_auto_provision_profiles.sql
-- ============================================================================

-- 1.1 Update profiles table to support auto-provisioning
ALTER TABLE profiles 
  ALTER COLUMN clerk_user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Add unique constraint on clerk_user_id (allow NULL but unique when present)
DROP INDEX IF EXISTS profiles_clerk_user_id_unique;
CREATE UNIQUE INDEX profiles_clerk_user_id_unique 
  ON profiles(clerk_user_id) 
  WHERE clerk_user_id IS NOT NULL;

-- 1.2 Update needs table to add owner_id and status
ALTER TABLE needs 
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
  ALTER COLUMN summary DROP NOT NULL,
  ALTER COLUMN tags DROP NOT NULL,
  ALTER COLUMN mode DROP NOT NULL,
  ALTER COLUMN prejoin_count DROP NOT NULL,
  ALTER COLUMN created_by DROP NOT NULL;

-- Add constraint for status values
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'needs_status_check'
  ) THEN
    ALTER TABLE needs 
      ADD CONSTRAINT needs_status_check 
      CHECK (status IN ('draft', 'published', 'closed'));
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS needs_owner_id_idx ON needs(owner_id);
CREATE INDEX IF NOT EXISTS needs_status_idx ON needs(status);

-- ============================================================================
-- Step 2: Create profiles for existing users
-- ============================================================================

-- 2.1 Insert profile for genkikono.2615@gmail.com
INSERT INTO profiles (clerk_user_id, email, full_name, role, created_at, updated_at)
VALUES (
  'user_32bLa5iVBa4KBRldf4nRvKXLVnS', -- Actual Clerk user ID from production
  'genkikono.2615@gmail.com',
  '元気 河野',
  'admin', -- Set as admin for main account
  NOW(),
  NOW()
) ON CONFLICT (clerk_user_id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- 2.2 Insert profile for genkikono.kochi@gmail.com  
INSERT INTO profiles (clerk_user_id, email, full_name, role, created_at, updated_at)
VALUES (
  'user_32b0oVi0qqVcHfNOiXef4mCTwHd', -- Actual Clerk user ID from production
  'genkikono.kochi@gmail.com',
  '元気 河野',
  'user',
  NOW(),
  NOW()
) ON CONFLICT (clerk_user_id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- 2.3 Insert profile for test@needport.dev
INSERT INTO profiles (clerk_user_id, email, full_name, role, created_at, updated_at)
VALUES (
  'user_32iEPCzsCKGMHC5OPJj7sJm6Geh', -- Actual Clerk user ID from production
  'test@needport.dev',
  'Test User',
  'user',
  NOW(),
  NOW()
) ON CONFLICT (clerk_user_id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- ============================================================================
-- Step 3: Update/Create RLS Policies for owner_id
-- ============================================================================

-- 3.1 Enable RLS on needs table (if not already enabled)
ALTER TABLE needs ENABLE ROW LEVEL SECURITY;

-- 3.2 Drop existing policies to recreate them
DROP POLICY IF EXISTS "public read needs" ON needs;
DROP POLICY IF EXISTS "needs_insert_policy" ON needs;
DROP POLICY IF EXISTS "public_read_published_needs" ON needs;
DROP POLICY IF EXISTS "owner_full_access_needs" ON needs;
DROP POLICY IF EXISTS "authenticated_insert_needs" ON needs;

-- 3.3 Create new RLS policies for owner_id based access
-- Policy 1: Public read for published needs
CREATE POLICY "public_read_published_needs" ON needs
  FOR SELECT 
  USING (status = 'published');

-- Policy 2: Owner has full access to their needs
CREATE POLICY "owner_full_access_needs" ON needs
  FOR ALL 
  USING (
    auth.uid()::text IN (
      SELECT clerk_user_id 
      FROM profiles 
      WHERE id = needs.owner_id
    )
  );

-- Policy 3: Authenticated users can insert needs (with owner_id check)
CREATE POLICY "authenticated_insert_needs" ON needs
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    owner_id IN (
      SELECT id 
      FROM profiles 
      WHERE clerk_user_id = auth.uid()::text
    )
  );

-- Policy 4: Admins can access all needs
CREATE POLICY "admin_full_access_needs" ON needs
  FOR ALL
  USING (
    auth.uid()::text IN (
      SELECT clerk_user_id 
      FROM profiles 
      WHERE role = 'admin'
    )
  );

-- ============================================================================
-- Step 4: Verification queries
-- ============================================================================

-- 4.1 Verify migration was applied correctly
SELECT 
  'Migration verification' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = 'email'
    ) THEN '✅ profiles.email column exists'
    ELSE '❌ profiles.email column missing'
  END as profiles_email,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'needs' AND column_name = 'owner_id'
    ) THEN '✅ needs.owner_id column exists'
    ELSE '❌ needs.owner_id column missing'
  END as needs_owner_id;

-- 4.2 Verify profiles were created
SELECT 
  'Profiles verification' as check_type,
  count(*) as total_profiles,
  count(*) FILTER (WHERE email LIKE '%genkikono%') as genkikono_profiles,
  count(*) FILTER (WHERE email = 'test@needport.dev') as test_profiles
FROM profiles;

-- 4.3 Verify RLS policies
SELECT 
  'RLS policies verification' as check_type,
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'needs'
ORDER BY policyname;

-- 4.4 Test data for verification
SELECT 
  'Sample data check' as check_type,
  p.email,
  p.full_name,
  p.clerk_user_id,
  count(n.id) as needs_count
FROM profiles p
LEFT JOIN needs n ON n.owner_id = p.id
WHERE p.email LIKE '%genkikono%' OR p.email = 'test@needport.dev'
GROUP BY p.id, p.email, p.full_name, p.clerk_user_id
ORDER BY p.email;

-- Output success message
SELECT '🎉 Auto-provisioning enablement completed successfully!' as status;