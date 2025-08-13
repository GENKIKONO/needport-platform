-- Create client_errors table for error logging
CREATE TABLE IF NOT EXISTS public.client_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT,
  message TEXT,
  stack TEXT,
  path TEXT,
  ua TEXT,
  ip TEXT
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_client_errors_at ON public.client_errors(at);
CREATE INDEX IF NOT EXISTS idx_client_errors_ip ON public.client_errors(ip);

-- Enable RLS
ALTER TABLE public.client_errors ENABLE ROW LEVEL SECURITY;

-- Only admins can read client errors
CREATE POLICY "Admins can read client errors" ON public.client_errors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role IN ('admin')
    )
  );

-- Allow inserts from service role (for error logging)
CREATE POLICY "Service role can insert client errors" ON public.client_errors
  FOR INSERT WITH CHECK (true);
