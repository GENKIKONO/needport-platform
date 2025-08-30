-- Create approvals table for chat room access control
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id UUID NOT NULL REFERENCES needs(id) ON DELETE CASCADE,
  applicant_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_approvals_need_id ON approvals(need_id);
CREATE INDEX IF NOT EXISTS idx_approvals_applicant_id ON approvals(applicant_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_created_at ON approvals(created_at DESC);

-- Enable RLS
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

-- Users can read their own approvals
CREATE POLICY "users_read_own_approvals" ON approvals
  FOR SELECT TO authenticated
  USING (applicant_id = auth.jwt() ->> 'sub');

-- Need owners can read approvals for their needs
CREATE POLICY "owners_read_need_approvals" ON approvals
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM needs 
      WHERE needs.id = approvals.need_id 
      AND needs.user_id = auth.jwt() ->> 'sub'
    )
  );

-- Users can insert their own applications
CREATE POLICY "users_insert_own_approvals" ON approvals
  FOR INSERT TO authenticated
  WITH CHECK (applicant_id = auth.jwt() ->> 'sub');

-- Need owners can update approvals for their needs
CREATE POLICY "owners_update_need_approvals" ON approvals
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM needs 
      WHERE needs.id = approvals.need_id 
      AND needs.user_id = auth.jwt() ->> 'sub'
    )
  );
