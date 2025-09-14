-- scripts/rls/needs-draft-insert.sql
-- Fix RLS policy for needs table to allow draft insertion only

-- Remove all existing INSERT policies on needs table
DO $
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='needs' AND cmd='INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.needs;', r.policyname);
  END LOOP;
END $;

-- Create new policy allowing only draft insertion for authenticated users
CREATE POLICY needs_insert_draft
  ON public.needs AS PERMISSIVE
  FOR INSERT TO authenticated
  WITH CHECK (COALESCE(status, 'draft') = 'draft');

-- Ensure published column has proper default if it exists
-- (Legacy support - status column is the primary control)
DO $
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'needs' 
    AND column_name = 'published'
  ) THEN
    ALTER TABLE public.needs ALTER COLUMN published SET DEFAULT false;
  END IF;
END $;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';