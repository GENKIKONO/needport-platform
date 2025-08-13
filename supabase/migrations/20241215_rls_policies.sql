-- Enable RLS on main tables
ALTER TABLE public.needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prejoins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "public read needs" ON public.needs;
DROP POLICY IF EXISTS "public insert needs" ON public.needs;
DROP POLICY IF EXISTS "public update needs" ON public.needs;
DROP POLICY IF EXISTS "public delete needs" ON public.needs;

DROP POLICY IF EXISTS "public read offers" ON public.offers;
DROP POLICY IF EXISTS "public insert offers" ON public.offers;
DROP POLICY IF EXISTS "public update offers" ON public.offers;
DROP POLICY IF EXISTS "public delete offers" ON public.offers;

DROP POLICY IF EXISTS "public read prejoins" ON public.prejoins;
DROP POLICY IF EXISTS "public insert prejoins" ON public.prejoins;
DROP POLICY IF EXISTS "public update prejoins" ON public.prejoins;
DROP POLICY IF EXISTS "public delete prejoins" ON public.prejoins;

-- Needs policies
CREATE POLICY "public read needs"
  ON public.needs FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "public insert needs"
  ON public.needs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Offers policies (read-only for public)
CREATE POLICY "public read offers"
  ON public.offers FOR SELECT
  TO anon, authenticated
  USING (true);

-- Prejoins policies
CREATE POLICY "public read prejoins"
  ON public.prejoins FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "public insert prejoins"
  ON public.prejoins FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Note: Updates and deletes are restricted to admin service role only
