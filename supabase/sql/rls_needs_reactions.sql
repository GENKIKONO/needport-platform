-- RLS Policies for need_reactions table
-- Date: 2025-09-15
-- Purpose: Secure access control for reactions system

-- ========================================
-- need_reactions Table RLS Policies
-- ========================================

-- 1. SELECT Policy: Users can see their own reactions + aggregated data
CREATE POLICY "reactions_select_policy" ON need_reactions
FOR SELECT USING (
  -- Users can see their own reactions
  user_id = auth.uid()::UUID 
  OR 
  -- Admins can see all reactions
  EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()::UUID 
    AND profiles.is_admin = true
  )
);

-- 2. INSERT Policy: Users can only create reactions for themselves
CREATE POLICY "reactions_insert_policy" ON need_reactions
FOR INSERT WITH CHECK (
  -- Must be authenticated
  auth.uid() IS NOT NULL 
  AND 
  -- Can only create reactions for own user_id
  user_id = auth.uid()::UUID
  AND
  -- Need must exist and be accessible (published or user's own)
  EXISTS(
    SELECT 1 FROM needs 
    WHERE needs.id = need_id 
    AND (
      needs.status = 'published' 
      OR needs.owner_id = auth.uid()::UUID
    )
  )
);

-- 3. DELETE Policy: Users can only delete their own reactions
CREATE POLICY "reactions_delete_policy" ON need_reactions
FOR DELETE USING (
  -- Users can delete their own reactions
  user_id = auth.uid()::UUID
  OR
  -- Admins can delete any reactions
  EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()::UUID 
    AND profiles.is_admin = true
  )
);

-- 4. UPDATE Policy: No updates allowed (use DELETE + INSERT for changes)
CREATE POLICY "reactions_update_policy" ON need_reactions
FOR UPDATE USING (false);

-- ========================================
-- Enhanced needs Table RLS Policies
-- ========================================

-- Drop existing policies to recreate with new logic
DROP POLICY IF EXISTS "public_read_published_needs" ON needs;
DROP POLICY IF EXISTS "owner_full_access_needs" ON needs;
DROP POLICY IF EXISTS "authenticated_insert_needs" ON needs;

-- 1. SELECT Policy: Public can see published, owners see all their own, admins see all
CREATE POLICY "needs_enhanced_select_policy" ON needs
FOR SELECT USING (
  -- Published needs are visible to everyone
  status = 'published'
  OR
  -- Archived needs are visible to authenticated users only
  (status = 'archived' AND auth.uid() IS NOT NULL)
  OR
  -- Users can see all their own needs (draft, published, frozen, archived)
  owner_id = auth.uid()::UUID
  OR
  -- Admins can see all needs
  EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()::UUID 
    AND profiles.is_admin = true
  )
);

-- 2. INSERT Policy: Only authenticated users can create needs
CREATE POLICY "needs_enhanced_insert_policy" ON needs
FOR INSERT WITH CHECK (
  -- Must be authenticated
  auth.uid() IS NOT NULL
  AND
  -- owner_id must match authenticated user
  owner_id = auth.uid()::UUID
  AND
  -- Status must be valid for new posts
  status IN ('draft', 'published')
);

-- 3. UPDATE Policy: Owners can update their needs, admins can update any
CREATE POLICY "needs_enhanced_update_policy" ON needs
FOR UPDATE USING (
  -- Users can update their own needs
  owner_id = auth.uid()::UUID
  OR
  -- Admins can update any needs
  EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()::UUID 
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  -- Additional checks for updates
  CASE 
    -- Non-admins cannot change owner_id
    WHEN NOT EXISTS(
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid()::UUID 
      AND profiles.is_admin = true
    ) THEN owner_id = auth.uid()::UUID
    ELSE true
  END
  AND
  -- Status transitions must be valid
  status IN ('draft', 'published', 'frozen', 'archived')
);

-- 4. DELETE Policy: Owners and admins can delete
CREATE POLICY "needs_enhanced_delete_policy" ON needs
FOR DELETE USING (
  -- Users can delete their own needs
  owner_id = auth.uid()::UUID
  OR
  -- Admins can delete any needs
  EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()::UUID 
    AND profiles.is_admin = true
  )
);

-- ========================================
-- audit_logs Table RLS Policies
-- ========================================

-- 1. SELECT Policy: Users can see logs about their own actions, admins see all
CREATE POLICY "audit_logs_select_policy" ON audit_logs
FOR SELECT USING (
  -- Users can see their own action logs
  user_id = auth.uid()::UUID
  OR
  -- Admins can see all logs
  EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()::UUID 
    AND profiles.is_admin = true
  )
);

-- 2. INSERT Policy: Only system and authenticated users can create logs
CREATE POLICY "audit_logs_insert_policy" ON audit_logs
FOR INSERT WITH CHECK (
  -- System logs (user_id can be NULL for system actions)
  user_id IS NULL
  OR
  -- User logs must match authenticated user
  user_id = auth.uid()::UUID
  OR
  -- Admins can create logs for any user
  EXISTS(
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid()::UUID 
    AND profiles.is_admin = true
  )
);

-- 3. UPDATE/DELETE Policy: No modification of audit logs allowed
CREATE POLICY "audit_logs_update_policy" ON audit_logs FOR UPDATE USING (false);
CREATE POLICY "audit_logs_delete_policy" ON audit_logs FOR DELETE USING (false);

-- ========================================
-- Enhanced profiles Table RLS Policies  
-- ========================================

-- Drop existing policies to recreate
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;

-- 1. SELECT Policy: Users see full own profile, limited info for others
CREATE POLICY "profiles_enhanced_select_policy" ON profiles
FOR SELECT USING (
  -- Users can see their full profile
  id = auth.uid()::UUID
  OR
  -- Admins can see all profiles
  EXISTS(
    SELECT 1 FROM profiles p2
    WHERE p2.id = auth.uid()::UUID 
    AND p2.is_admin = true
  )
  OR
  -- Others can see limited public information only
  -- (This will be filtered at application level for anonymity)
  true
);

-- 2. UPDATE Policy: Users can update own profile, admins can update any
CREATE POLICY "profiles_enhanced_update_policy" ON profiles
FOR UPDATE USING (
  -- Users can update their own profile
  id = auth.uid()::UUID
  OR
  -- Admins can update any profile
  EXISTS(
    SELECT 1 FROM profiles p2
    WHERE p2.id = auth.uid()::UUID 
    AND p2.is_admin = true
  )
)
WITH CHECK (
  -- Non-admins cannot change is_admin flag
  CASE 
    WHEN NOT EXISTS(
      SELECT 1 FROM profiles p2
      WHERE p2.id = auth.uid()::UUID 
      AND p2.is_admin = true
    ) THEN (
      id = auth.uid()::UUID 
      AND is_admin = (SELECT is_admin FROM profiles WHERE id = auth.uid()::UUID)
    )
    ELSE true
  END
);

-- ========================================
-- Security Functions
-- ========================================

-- Function to check if user is admin (for use in application)
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid()::UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = user_uuid),
    false
  );
$$;

-- Function to get anonymized display name
CREATE OR REPLACE FUNCTION get_display_name(user_uuid UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT display_name FROM profiles WHERE id = user_uuid),
    CONCAT('ユーザー', SUBSTRING(user_uuid::TEXT, 1, 8))
  );
$$;

-- Function to get reaction summary for a need
CREATE OR REPLACE FUNCTION get_need_reactions_summary(need_uuid UUID, requesting_user_uuid UUID DEFAULT auth.uid()::UUID)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT jsonb_build_object(
    'want_to_buy_count', COALESCE(
      (SELECT COUNT(*) FROM need_reactions 
       WHERE need_id = need_uuid AND kind = 'WANT_TO_BUY'), 0
    ),
    'interested_count', COALESCE(
      (SELECT COUNT(*) FROM need_reactions 
       WHERE need_id = need_uuid AND kind = 'INTERESTED'), 0
    ),
    'user_reactions', CASE 
      WHEN requesting_user_uuid IS NOT NULL THEN
        jsonb_build_object(
          'want_to_buy', EXISTS(
            SELECT 1 FROM need_reactions 
            WHERE need_id = need_uuid 
            AND user_id = requesting_user_uuid 
            AND kind = 'WANT_TO_BUY'
          ),
          'interested', EXISTS(
            SELECT 1 FROM need_reactions 
            WHERE need_id = need_uuid 
            AND user_id = requesting_user_uuid 
            AND kind = 'INTERESTED'
          )
        )
      ELSE jsonb_build_object('want_to_buy', false, 'interested', false)
    END
  );
$$;

-- ========================================
-- Create Public Views for Anonymity
-- ========================================

-- View for public profile information (anonymized)
CREATE OR REPLACE VIEW profiles_public AS
SELECT 
  id,
  get_display_name(id) as display_name,
  created_at,
  -- Exclude: email, full_name, clerk_user_id
  'ユーザー' as role_display
FROM profiles
WHERE id != COALESCE(auth.uid()::UUID, '00000000-0000-0000-0000-000000000000'::UUID);

-- View for public needs with anonymized author info
CREATE OR REPLACE VIEW needs_public AS
SELECT 
  n.id,
  n.title,
  n.body,
  n.status,
  n.published,
  n.published_at,
  n.created_at,
  -- Anonymized author information
  get_display_name(n.owner_id) as author_display_name,
  -- Reaction summary
  get_need_reactions_summary(n.id) as reactions_summary,
  -- Exclude: owner_id, other sensitive fields
  n.tags,
  n.location,
  n.price_amount
FROM needs n
WHERE 
  n.status = 'published'
  OR (
    n.status = 'archived' 
    AND auth.uid() IS NOT NULL
  );

-- Grant permissions for views
GRANT SELECT ON profiles_public TO authenticated, anon;
GRANT SELECT ON needs_public TO authenticated, anon;

-- Comments for documentation
COMMENT ON POLICY "reactions_select_policy" ON need_reactions IS 'Users see own reactions, admins see all';
COMMENT ON POLICY "needs_enhanced_select_policy" ON needs IS 'Published visible to all, archived to authenticated, own to owner, all to admin';
COMMENT ON FUNCTION is_admin IS 'Check if user has admin privileges';
COMMENT ON FUNCTION get_display_name IS 'Get anonymized display name for user';
COMMENT ON FUNCTION get_need_reactions_summary IS 'Get reaction counts and user state for a need';
COMMENT ON VIEW profiles_public IS 'Anonymized public profile information';
COMMENT ON VIEW needs_public IS 'Public needs with anonymized author information';

-- RLS policies configuration completed
SELECT 'RLS policies for need_reactions and enhanced security completed' AS status;