-- Add lifecycle management columns to needs table
ALTER TABLE needs 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'closed', 'archived')) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing needs to have 'active' status
UPDATE needs SET status = 'active' WHERE status IS NULL;

-- Create index for efficient lifecycle queries
CREATE INDEX IF NOT EXISTS idx_needs_status ON needs(status);
CREATE INDEX IF NOT EXISTS idx_needs_last_activity ON needs(last_activity_at);

-- Add RLS policy for needs updates (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'needs' 
    AND policyname = 'users_update_own_needs'
  ) THEN
    CREATE POLICY "users_update_own_needs" ON needs
      FOR UPDATE TO authenticated
      USING (user_id = auth.jwt() ->> 'sub');
  END IF;
END $$;
