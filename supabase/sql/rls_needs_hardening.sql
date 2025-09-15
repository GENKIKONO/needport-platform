-- RLS Security Hardening and Additional Constraints
-- Date: 2025-09-15
-- Purpose: Additional security measures and data integrity constraints

-- ========================================
-- Additional Security Constraints
-- ========================================

-- 1. Add constraint to ensure owner_id is set for non-draft needs
ALTER TABLE needs 
ADD CONSTRAINT needs_owner_required_for_published 
CHECK (
  (status = 'draft') OR 
  (status IN ('published', 'frozen', 'archived') AND owner_id IS NOT NULL)
);

-- 2. Add constraint to ensure published_at is set for published needs
ALTER TABLE needs 
ADD CONSTRAINT needs_published_at_required 
CHECK (
  (status != 'published') OR 
  (status = 'published' AND published_at IS NOT NULL)
);

-- 3. Add constraint to ensure archived_at is set for archived needs
ALTER TABLE needs 
ADD CONSTRAINT needs_archived_at_required 
CHECK (
  (status != 'archived') OR 
  (status = 'archived' AND archived_at IS NOT NULL)
);

-- ========================================
-- Enhanced Audit Trigger Functions
-- ========================================

-- Function to automatically log need changes
CREATE OR REPLACE FUNCTION audit_needs_changes()
RETURNS TRIGGER AS $$
DECLARE
  action_type TEXT;
  old_values_json JSONB;
  new_values_json JSONB;
BEGIN
  -- Determine action type
  IF TG_OP = 'INSERT' THEN
    action_type := 'CREATE_NEED';
    old_values_json := NULL;
    new_values_json := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := CASE 
      WHEN NEW.status = 'frozen' AND OLD.status != 'frozen' THEN 'FREEZE_NEED'
      WHEN NEW.status = 'archived' AND OLD.status != 'archived' THEN 'ARCHIVE_NEED'
      WHEN NEW.status = 'published' AND OLD.status != 'published' THEN 'PUBLISH_NEED'
      ELSE 'UPDATE_NEED'
    END;
    old_values_json := to_jsonb(OLD);
    new_values_json := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'DELETE_NEED';
    old_values_json := to_jsonb(OLD);
    new_values_json := NULL;
  END IF;

  -- Log the action (only if user context is available)
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO audit_logs (
      user_id, action, resource_type, resource_id,
      old_values, new_values, session_id
    ) VALUES (
      auth.uid()::UUID, action_type, 'needs', 
      COALESCE(NEW.id, OLD.id),
      old_values_json, new_values_json,
      current_setting('app.session_id', true)
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically log reaction changes
CREATE OR REPLACE FUNCTION audit_reactions_changes()
RETURNS TRIGGER AS $$
DECLARE
  action_type TEXT;
BEGIN
  -- Determine action type
  IF TG_OP = 'INSERT' THEN
    action_type := 'ADD_REACTION';
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'REMOVE_REACTION';
  END IF;

  -- Log the action
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO audit_logs (
      user_id, action, resource_type, resource_id,
      old_values, new_values
    ) VALUES (
      auth.uid()::UUID, action_type, 'need_reactions',
      COALESCE(NEW.id, OLD.id),
      CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
      CASE WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW) ELSE NULL END
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for audit logging
DROP TRIGGER IF EXISTS audit_needs_trigger ON needs;
CREATE TRIGGER audit_needs_trigger
  AFTER INSERT OR UPDATE OR DELETE ON needs
  FOR EACH ROW EXECUTE FUNCTION audit_needs_changes();

DROP TRIGGER IF EXISTS audit_reactions_trigger ON need_reactions;
CREATE TRIGGER audit_reactions_trigger
  AFTER INSERT OR DELETE ON need_reactions
  FOR EACH ROW EXECUTE FUNCTION audit_reactions_changes();

-- ========================================
-- Security Functions for API Layer
-- ========================================

-- Function to verify need ownership
CREATE OR REPLACE FUNCTION verify_need_ownership(need_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS(
    SELECT 1 FROM needs 
    WHERE id = need_uuid 
    AND owner_id = user_uuid
  );
$$;

-- Function to safely get need for user (respects RLS)
CREATE OR REPLACE FUNCTION get_need_for_user(need_uuid UUID, user_uuid UUID DEFAULT auth.uid()::UUID)
RETURNS SETOF needs
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT * FROM needs 
  WHERE id = need_uuid
  AND (
    status = 'published' OR
    (status = 'archived' AND user_uuid IS NOT NULL) OR
    owner_id = user_uuid OR
    is_admin(user_uuid)
  );
$$;

-- Function to get user's needs with counts
CREATE OR REPLACE FUNCTION get_user_needs_summary(user_uuid UUID)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT jsonb_build_object(
    'total_needs', COUNT(*),
    'drafts', COUNT(*) FILTER (WHERE status = 'draft'),
    'published', COUNT(*) FILTER (WHERE status = 'published'),
    'archived', COUNT(*) FILTER (WHERE status = 'archived'),
    'frozen', COUNT(*) FILTER (WHERE status = 'frozen')
  )
  FROM needs
  WHERE owner_id = user_uuid;
$$;

-- ========================================
-- Data Integrity Enforcement
-- ========================================

-- Function to validate reaction kind
CREATE OR REPLACE FUNCTION validate_reaction_kind()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.kind NOT IN ('WANT_TO_BUY', 'INTERESTED') THEN
    RAISE EXCEPTION 'Invalid reaction kind: %', NEW.kind;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reaction validation
DROP TRIGGER IF EXISTS validate_reaction_kind_trigger ON need_reactions;
CREATE TRIGGER validate_reaction_kind_trigger
  BEFORE INSERT OR UPDATE ON need_reactions
  FOR EACH ROW EXECUTE FUNCTION validate_reaction_kind();

-- Function to prevent orphaned reactions
CREATE OR REPLACE FUNCTION prevent_orphaned_reactions()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the referenced need exists and is accessible
  IF NOT EXISTS(
    SELECT 1 FROM needs 
    WHERE id = NEW.need_id 
    AND status IN ('published', 'archived')
  ) THEN
    RAISE EXCEPTION 'Cannot create reaction for non-published need';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for orphan prevention
DROP TRIGGER IF EXISTS prevent_orphaned_reactions_trigger ON need_reactions;
CREATE TRIGGER prevent_orphaned_reactions_trigger
  BEFORE INSERT ON need_reactions
  FOR EACH ROW EXECUTE FUNCTION prevent_orphaned_reactions();

-- ========================================
-- Performance Optimization Functions
-- ========================================

-- Function to refresh reaction summary view
CREATE OR REPLACE FUNCTION refresh_reactions_summary()
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
  REFRESH MATERIALIZED VIEW need_reactions_summary;
$$;

-- Function to get popular needs (for caching)
CREATE OR REPLACE FUNCTION get_popular_needs(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  need_id UUID,
  title TEXT,
  total_reactions BIGINT,
  author_display_name TEXT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    n.id,
    n.title,
    COALESCE(rs.total_reactions, 0),
    get_display_name(n.owner_id)
  FROM needs n
  LEFT JOIN need_reactions_summary rs ON n.id = rs.need_id
  WHERE n.status = 'published'
  ORDER BY COALESCE(rs.total_reactions, 0) DESC, n.created_at DESC
  LIMIT limit_count;
$$;

-- ========================================
-- Admin Utility Functions
-- ========================================

-- Function for admin to get comprehensive need info
CREATE OR REPLACE FUNCTION admin_get_need_details(need_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  need_data JSONB;
  reactions_data JSONB;
  audit_data JSONB;
BEGIN
  -- Check admin permissions
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  -- Get need data
  SELECT to_jsonb(n.*) INTO need_data
  FROM needs n WHERE n.id = need_uuid;
  
  -- Get reactions summary
  SELECT get_need_reactions_summary(need_uuid) INTO reactions_data;
  
  -- Get recent audit logs
  SELECT jsonb_agg(
    jsonb_build_object(
      'action', action,
      'user_id', user_id,
      'created_at', created_at,
      'old_values', old_values,
      'new_values', new_values
    )
  ) INTO audit_data
  FROM audit_logs
  WHERE resource_type = 'needs' AND resource_id = need_uuid
  ORDER BY created_at DESC
  LIMIT 20;
  
  RETURN jsonb_build_object(
    'need', need_data,
    'reactions', reactions_data,
    'audit_trail', COALESCE(audit_data, '[]'::jsonb)
  );
END;
$$;

-- Function to bulk archive needs
CREATE OR REPLACE FUNCTION admin_bulk_archive_needs(need_ids UUID[])
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- Check admin permissions
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  -- Archive the needs
  UPDATE needs
  SET status = 'archived', archived_at = NOW()
  WHERE id = ANY(need_ids)
  AND status != 'archived';
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  
  -- Log bulk action
  INSERT INTO audit_logs (
    user_id, action, resource_type, resource_id,
    new_values
  ) VALUES (
    auth.uid()::UUID, 'BULK_ARCHIVE', 'needs', NULL,
    jsonb_build_object('archived_ids', need_ids, 'count', archived_count)
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'archived_count', archived_count,
    'total_requested', array_length(need_ids, 1)
  );
END;
$$;

-- ========================================
-- Grant Permissions
-- ========================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION verify_need_ownership TO authenticated;
GRANT EXECUTE ON FUNCTION get_need_for_user TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_needs_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_display_name TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION get_need_reactions_summary TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_popular_needs TO authenticated, anon;

-- Grant admin-only functions
GRANT EXECUTE ON FUNCTION admin_get_need_details TO authenticated;
GRANT EXECUTE ON FUNCTION admin_bulk_archive_needs TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_reactions_summary TO authenticated;

-- ========================================
-- Create Indexes for Performance
-- ========================================

-- Additional indexes for common queries
CREATE INDEX IF NOT EXISTS idx_needs_status_published_at ON needs(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_needs_owner_status ON needs(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_created ON audit_logs(resource_type, resource_id, created_at DESC);

-- Partial indexes for performance
CREATE INDEX IF NOT EXISTS idx_needs_published_active 
ON needs(created_at DESC) 
WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_needs_archived_recent 
ON needs(archived_at DESC) 
WHERE status = 'archived';

-- ========================================
-- Final Comments and Documentation
-- ========================================

COMMENT ON FUNCTION verify_need_ownership IS 'Check if user owns a specific need';
COMMENT ON FUNCTION get_need_for_user IS 'Get need respecting user permissions and RLS';
COMMENT ON FUNCTION get_user_needs_summary IS 'Get summary counts of user needs by status';
COMMENT ON FUNCTION admin_get_need_details IS 'Admin function to get comprehensive need information';
COMMENT ON FUNCTION admin_bulk_archive_needs IS 'Admin function to archive multiple needs at once';
COMMENT ON FUNCTION refresh_reactions_summary IS 'Refresh materialized view for reaction counts';

-- Security hardening completed
SELECT 'RLS security hardening and additional constraints completed' AS status;