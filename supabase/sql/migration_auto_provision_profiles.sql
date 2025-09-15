-- Migration: Auto-provision profiles and update needs schema
-- Date: 2025-09-15
-- Purpose: Add auto-provisioning support and update database schema

-- 1. Update profiles table to support auto-provisioning
ALTER TABLE profiles 
  ALTER COLUMN clerk_user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Add unique constraint on clerk_user_id (allow NULL but unique when present)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_clerk_user_id_unique 
  ON profiles(clerk_user_id) 
  WHERE clerk_user_id IS NOT NULL;

-- 2. Update needs table to add owner_id and status
ALTER TABLE needs 
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
  ALTER COLUMN summary DROP NOT NULL,
  ALTER COLUMN tags DROP NOT NULL,
  ALTER COLUMN mode DROP NOT NULL,
  ALTER COLUMN prejoin_count DROP NOT NULL,
  ALTER COLUMN created_by DROP NOT NULL;

-- Add constraint for status values
ALTER TABLE needs 
  ADD CONSTRAINT needs_status_check 
  CHECK (status IN ('draft', 'published', 'closed'));

-- Create index on owner_id for better performance
CREATE INDEX IF NOT EXISTS needs_owner_id_idx ON needs(owner_id);
CREATE INDEX IF NOT EXISTS needs_status_idx ON needs(status);

-- 3. Update existing needs to have owner_id based on created_by
-- This migration assumes that created_by currently contains profile IDs
UPDATE needs 
SET owner_id = created_by::UUID 
WHERE owner_id IS NULL 
  AND created_by IS NOT NULL 
  AND created_by ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- 4. Update RLS policies for the new schema
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "public read needs" ON needs;
DROP POLICY IF EXISTS "needs_insert_policy" ON needs;

-- Create new RLS policies
CREATE POLICY "public_read_published_needs" ON needs
  FOR SELECT USING (status = 'published');

CREATE POLICY "owner_full_access_needs" ON needs
  FOR ALL USING (auth.uid()::text IN (
    SELECT clerk_user_id FROM profiles WHERE id = needs.owner_id
  ));

CREATE POLICY "authenticated_insert_needs" ON needs
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    owner_id IN (
      SELECT id FROM profiles WHERE clerk_user_id = auth.uid()::text
    )
  );

-- 5. Create function to ensure profile exists (used by the application)
-- This is mainly for documentation, the actual logic is in the application
CREATE OR REPLACE FUNCTION ensure_profile_comment() 
RETURNS TEXT 
LANGUAGE sql 
AS $$
  SELECT 'Profile auto-provisioning is handled by the application layer via ensureProfile() function'::TEXT;
$$;

COMMENT ON FUNCTION ensure_profile_comment() IS 
'This function is a placeholder. Profile auto-provisioning is handled by the ensureProfile() function in src/lib/ensureProfile.ts';

-- 6. Update schema comments
COMMENT ON COLUMN profiles.clerk_user_id IS 'Clerk user ID - nullable to support auto-provisioning';
COMMENT ON COLUMN profiles.email IS 'User email from Clerk - used for auto-provisioning';
COMMENT ON COLUMN profiles.full_name IS 'User full name from Clerk - used for auto-provisioning';
COMMENT ON COLUMN needs.owner_id IS 'References profiles.id - set via auto-provisioning';
COMMENT ON COLUMN needs.status IS 'Need status: draft, published, or closed';

-- Commit the migration
SELECT 'Auto-provision profiles migration completed successfully' AS migration_status;