-- Fix needs table schema and RLS policies
-- Execute this in Supabase SQL Editor

-- 1. Add missing body column if it doesn't exist (NOT NULL with default)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='needs' AND column_name='body'
  ) THEN
    ALTER TABLE public.needs
      ADD COLUMN body text NOT NULL DEFAULT '';
    RAISE NOTICE 'Added body column to needs table';
  ELSE
    RAISE NOTICE 'body column already exists in needs table';
  END IF;
END $$;

-- 2. Add missing area column if it doesn't exist (nullable)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='needs' AND column_name='area'
  ) THEN
    ALTER TABLE public.needs
      ADD COLUMN area text;
    RAISE NOTICE 'Added area column to needs table';
  ELSE
    RAISE NOTICE 'area column already exists in needs table';
  END IF;
END $$;

-- 3. Ensure created_by column exists and references profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='needs' AND column_name='created_by'
  ) THEN
    ALTER TABLE public.needs
      ADD COLUMN created_by UUID REFERENCES profiles(id);
    RAISE NOTICE 'Added created_by column to needs table';
  ELSE
    RAISE NOTICE 'created_by column already exists in needs table';
  END IF;
END $$;

-- 4. Enable RLS if not already enabled
ALTER TABLE public.needs ENABLE ROW LEVEL SECURITY;

-- 5. Create trigger function to auto-set created_by
CREATE OR REPLACE FUNCTION public.set_created_by() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END; $$;

-- 6. Create trigger (drop if exists first)
DROP TRIGGER IF EXISTS trg_set_created_by ON public.needs;
CREATE TRIGGER trg_set_created_by
BEFORE INSERT ON public.needs
FOR EACH ROW EXECUTE FUNCTION public.set_created_by();

-- 7. Create RLS policies for needs table
-- Insert policy: authenticated users can insert with their own created_by
DROP POLICY IF EXISTS "insert needs by auth user" ON public.needs;
CREATE POLICY "insert needs by auth user"
ON public.needs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND (created_by = auth.uid() OR created_by IS NULL));

-- Select policy: anyone can read needs (public visibility)
DROP POLICY IF EXISTS "select needs public" ON public.needs;
CREATE POLICY "select needs public"
ON public.needs
FOR SELECT
TO anon, authenticated
USING (true);

-- Update policy: users can update their own needs
DROP POLICY IF EXISTS "update own needs" ON public.needs;
CREATE POLICY "update own needs"
ON public.needs
FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Delete policy: users can delete their own needs
DROP POLICY IF EXISTS "delete own needs" ON public.needs;
CREATE POLICY "delete own needs"
ON public.needs
FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- 8. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- 9. Show current table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'needs'
ORDER BY ordinal_position;