-- 002-collective-demand.sql
-- Collective Demand Visualization (Lv1)
-- Adds threshold_pledge, need_engagements, and need_anonymous_interest tables

-- 0) Ensure pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Add threshold_pledge column to existing needs table
ALTER TABLE public.needs
  ADD COLUMN IF NOT EXISTS threshold_pledge integer NOT NULL DEFAULT 5;

-- 2) Create engagement_kind enum
DO $$ 
BEGIN
  CREATE TYPE engagement_kind AS ENUM ('interest', 'pledge');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3) Create need_engagements table for logged-in user reactions
CREATE TABLE IF NOT EXISTS public.need_engagements (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id    uuid NOT NULL REFERENCES public.needs(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL,   -- references profiles.id (Clerk bridge)
  kind       engagement_kind NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (need_id, user_id, kind)
);

-- 4) Create need_anonymous_interest table for anonymous reactions
CREATE TABLE IF NOT EXISTS public.need_anonymous_interest (
  id         bigserial PRIMARY KEY,
  need_id    uuid NOT NULL REFERENCES public.needs(id) ON DELETE CASCADE,
  anon_key   text NOT NULL,    -- sha256(IP+UA+salt) hash
  day        date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (need_id, anon_key, day)
);

-- 5) Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_need_engagements_need_id ON public.need_engagements(need_id);
CREATE INDEX IF NOT EXISTS idx_need_engagements_user_id ON public.need_engagements(user_id);
CREATE INDEX IF NOT EXISTS idx_need_anonymous_interest_need_id ON public.need_anonymous_interest(need_id);
CREATE INDEX IF NOT EXISTS idx_need_anonymous_interest_day ON public.need_anonymous_interest(day);

-- 6) Enable RLS (Row Level Security)
ALTER TABLE public.need_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.need_anonymous_interest ENABLE ROW LEVEL SECURITY;

-- 7) RLS Policies for need_engagements
DROP POLICY IF EXISTS "insert own engagement" ON public.need_engagements;
CREATE POLICY "insert own engagement"
  ON public.need_engagements FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "update own engagement" ON public.need_engagements;
CREATE POLICY "update own engagement"
  ON public.need_engagements FOR UPDATE TO authenticated
  USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "delete own engagement" ON public.need_engagements;
CREATE POLICY "delete own engagement"
  ON public.need_engagements FOR DELETE TO authenticated
  USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "read engagements" ON public.need_engagements;
CREATE POLICY "read engagements"
  ON public.need_engagements FOR SELECT TO anon, authenticated
  USING (true);

-- 8) RLS Policies for need_anonymous_interest
DROP POLICY IF EXISTS "insert anon interest" ON public.need_anonymous_interest;
CREATE POLICY "insert anon interest"
  ON public.need_anonymous_interest FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "read anon interest" ON public.need_anonymous_interest;
CREATE POLICY "read anon interest"
  ON public.need_anonymous_interest FOR SELECT TO anon, authenticated
  USING (true);

-- 9) Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';