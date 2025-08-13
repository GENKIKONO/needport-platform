-- Create vendor_invites table for invitation ledger
CREATE TABLE IF NOT EXISTS public.vendor_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id UUID NOT NULL REFERENCES public.needs(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_vendor_invites_need_id ON public.vendor_invites(need_id);
CREATE INDEX IF NOT EXISTS idx_vendor_invites_created_at ON public.vendor_invites(created_at);

-- Enable RLS
ALTER TABLE public.vendor_invites ENABLE ROW LEVEL SECURITY;

-- Only admins can read vendor invites
CREATE POLICY "Admins can read vendor invites" ON public.vendor_invites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role IN ('admin')
    )
  );

-- Allow inserts from service role (for admin UI)
CREATE POLICY "Service role can insert vendor invites" ON public.vendor_invites
  FOR INSERT WITH CHECK (true);
