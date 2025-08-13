-- Create consents table for compliance logging
CREATE TABLE IF NOT EXISTS public.consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL, -- 'need.create'|'prejoin.create'
  ref_id TEXT,           -- need id or prejoin id
  ip_hash TEXT,          -- sha256 of ip + day salt
  ua TEXT,               -- user agent
  at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_consents_subject_ref_id ON public.consents(subject, ref_id);
CREATE INDEX IF NOT EXISTS idx_consents_at ON public.consents(at);

-- Enable RLS
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;

-- Only admins can read consents
CREATE POLICY "Admins can read consents" ON public.consents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role IN ('admin')
    )
  );

-- Allow inserts from service role (for logging)
CREATE POLICY "Service role can insert consents" ON public.consents
  FOR INSERT WITH CHECK (true);
