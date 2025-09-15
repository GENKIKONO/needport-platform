-- Migration: Create need_reactions table and audit system
-- Date: 2025-09-15
-- Purpose: Add reactions system and enhanced audit logging

-- 1. Create need_reactions table
CREATE TABLE IF NOT EXISTS need_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id UUID NOT NULL REFERENCES needs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('WANT_TO_BUY', 'INTERESTED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint for toggle functionality
  UNIQUE(need_id, user_id, kind)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_need_reactions_need_id ON need_reactions(need_id);
CREATE INDEX IF NOT EXISTS idx_need_reactions_user_id ON need_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_need_reactions_kind ON need_reactions(kind);
CREATE INDEX IF NOT EXISTS idx_need_reactions_created_at ON need_reactions(created_at);

-- 2. Add columns to needs table for archiving
ALTER TABLE needs 
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS display_title TEXT;

-- Update published_at for existing published needs
UPDATE needs 
SET published_at = created_at 
WHERE status = 'published' AND published_at IS NULL;

-- 3. Add columns to profiles table for anonymity
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS anonymity_level TEXT DEFAULT 'standard';

-- 4. Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 5. Create materialized view for reaction counts (performance optimization)
CREATE MATERIALIZED VIEW IF NOT EXISTS need_reactions_summary AS
SELECT 
  need_id,
  SUM(CASE WHEN kind = 'WANT_TO_BUY' THEN 1 ELSE 0 END) as want_to_buy_count,
  SUM(CASE WHEN kind = 'INTERESTED' THEN 1 ELSE 0 END) as interested_count,
  COUNT(*) as total_reactions
FROM need_reactions
GROUP BY need_id;

-- Create unique index for the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_need_reactions_summary_need_id 
ON need_reactions_summary(need_id);

-- 6. Create function to toggle reactions
CREATE OR REPLACE FUNCTION toggle_reaction(
  p_need_id UUID,
  p_user_id UUID,
  p_kind TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_reaction need_reactions%ROWTYPE;
  action_taken TEXT;
  total_count INTEGER;
BEGIN
  -- Check if reaction already exists
  SELECT * INTO existing_reaction
  FROM need_reactions
  WHERE need_id = p_need_id AND user_id = p_user_id AND kind = p_kind;
  
  IF FOUND THEN
    -- Remove existing reaction
    DELETE FROM need_reactions
    WHERE need_id = p_need_id AND user_id = p_user_id AND kind = p_kind;
    action_taken := 'removed';
  ELSE
    -- Add new reaction
    INSERT INTO need_reactions (need_id, user_id, kind)
    VALUES (p_need_id, p_user_id, p_kind);
    action_taken := 'added';
  END IF;
  
  -- Get updated count
  SELECT COUNT(*) INTO total_count
  FROM need_reactions
  WHERE need_id = p_need_id AND kind = p_kind;
  
  -- Refresh materialized view
  REFRESH MATERIALIZED VIEW need_reactions_summary;
  
  RETURN jsonb_build_object(
    'action', action_taken,
    'current_state', CASE WHEN action_taken = 'added' THEN true ELSE false END,
    'total_count', total_count
  );
END;
$$;

-- 7. Create function to archive stale needs
CREATE OR REPLACE FUNCTION archive_stale_needs(days_threshold INTEGER DEFAULT 60)
RETURNS TABLE(archived_need_id UUID, need_title TEXT, owner_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  UPDATE needs
  SET 
    status = 'archived',
    archived_at = NOW()
  WHERE 
    status = 'published' 
    AND archived_at IS NULL
    AND published_at <= (NOW() - INTERVAL '1 day' * days_threshold)
  RETURNING id, title, needs.owner_id;
END;
$$;

-- 8. Create function for audit logging
CREATE OR REPLACE FUNCTION log_audit_action(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id, action, resource_type, resource_id,
    old_values, new_values, ip_address, user_agent
  ) VALUES (
    p_user_id, p_action, p_resource_type, p_resource_id,
    p_old_values, p_new_values, p_ip_address, p_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- 9. Enable RLS on new tables
ALTER TABLE need_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 10. Update needs table status constraint to include new statuses
ALTER TABLE needs DROP CONSTRAINT IF EXISTS needs_status_check;
ALTER TABLE needs ADD CONSTRAINT needs_status_check 
  CHECK (status IN ('draft', 'published', 'frozen', 'archived'));

-- 11. Create trigger for automatic published_at setting
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Set published_at when status changes to published
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    NEW.published_at = NOW();
  END IF;
  
  -- Clear published_at when status changes from published
  IF NEW.status != 'published' AND OLD.status = 'published' THEN
    NEW.published_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_published_at
  BEFORE UPDATE ON needs
  FOR EACH ROW
  EXECUTE FUNCTION set_published_at();

-- 12. Comments for documentation
COMMENT ON TABLE need_reactions IS 'User reactions to needs (toggle functionality)';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all system actions';
COMMENT ON MATERIALIZED VIEW need_reactions_summary IS 'Optimized reaction counts per need';
COMMENT ON FUNCTION toggle_reaction IS 'Toggle user reaction on a need (add/remove)';
COMMENT ON FUNCTION archive_stale_needs IS 'Archive needs older than specified days';
COMMENT ON FUNCTION log_audit_action IS 'Log user actions for audit purposes';

-- Migration completed successfully
SELECT 'Need reactions and audit system migration completed' AS status;