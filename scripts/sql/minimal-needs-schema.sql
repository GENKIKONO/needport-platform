-- Minimal needs schema migration (additive only)
-- Purpose: Ensure minimal posting flow with title/body works
-- Rule: Non-destructive, ADD IF NOT EXISTS only

-- Add minimal required columns (if they don't exist)
ALTER TABLE public.needs
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS body text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS published boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_needs_owner ON public.needs(owner_id);
CREATE INDEX IF NOT EXISTS idx_needs_status ON public.needs(status);
CREATE INDEX IF NOT EXISTS idx_needs_published ON public.needs(published);

-- Auto-set owner_id on INSERT (trigger function)
CREATE OR REPLACE FUNCTION public.set_need_owner()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.owner_id IS NULL THEN
    NEW.owner_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'tr_set_need_owner'
  ) THEN
    CREATE TRIGGER tr_set_need_owner
    BEFORE INSERT ON public.needs
    FOR EACH ROW EXECUTE PROCEDURE public.set_need_owner();
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.needs ENABLE ROW LEVEL SECURITY;

-- Public read policy (published records)
DROP POLICY IF EXISTS needs_public_r ON public.needs;
CREATE POLICY needs_public_r
ON public.needs
FOR SELECT TO anon, authenticated
USING (COALESCE(published,false) = true OR status = 'published');

-- Owner read policy (own drafts)
DROP POLICY IF EXISTS needs_owner_r ON public.needs;
CREATE POLICY needs_owner_r
ON public.needs
FOR SELECT TO authenticated
USING (owner_id = auth.uid());

-- Owner insert policy (minimal flow)
DROP POLICY IF EXISTS needs_owner_insert ON public.needs;
CREATE POLICY needs_owner_insert
ON public.needs
FOR INSERT TO authenticated 
WITH CHECK (owner_id = auth.uid() OR owner_id IS NULL);

-- Owner update policy
DROP POLICY IF EXISTS needs_owner_update ON public.needs;
CREATE POLICY needs_owner_update
ON public.needs
FOR UPDATE TO authenticated 
USING (owner_id = auth.uid()) 
WITH CHECK (owner_id = auth.uid());

-- Owner delete policy
DROP POLICY IF EXISTS needs_owner_delete ON public.needs;
CREATE POLICY needs_owner_delete
ON public.needs
FOR DELETE TO authenticated 
USING (owner_id = auth.uid());