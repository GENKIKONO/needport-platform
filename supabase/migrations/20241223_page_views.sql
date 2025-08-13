-- Create page_views table for tracking user visits
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  at TIMESTAMPTZ DEFAULT NOW(),
  path TEXT NOT NULL,
  need_id UUID REFERENCES public.needs(id) ON DELETE SET NULL,
  referer TEXT,
  utm JSONB,
  client_id TEXT,
  ua TEXT,
  ip TEXT
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_page_views_at ON public.page_views(at);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON public.page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_need_id ON public.page_views(need_id);
CREATE INDEX IF NOT EXISTS idx_page_views_client_id ON public.page_views(client_id);
CREATE INDEX IF NOT EXISTS idx_page_views_ip_at ON public.page_views(ip, at);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Allow inserts from service role (for tracking)
CREATE POLICY "Service role can insert page views" ON public.page_views
  FOR INSERT WITH CHECK (true);

-- Only admins can read page views
CREATE POLICY "Admins can read page views" ON public.page_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role IN ('admin')
    )
  );
