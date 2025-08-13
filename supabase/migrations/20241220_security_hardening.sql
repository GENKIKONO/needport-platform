-- Security Hardening Migration
-- Date: 2024-12-20
-- Purpose: Implement production-ready RLS policies

-- 1. Update needs table to require published=true for public read
DROP POLICY IF EXISTS "Anyone can view needs" ON needs;
CREATE POLICY "Public can view published needs" ON needs
  FOR SELECT TO anon, authenticated
  USING (published = true);

-- 2. Restrict offers to read-only for public
DROP POLICY IF EXISTS "dev read offers" ON public.offers;
DROP POLICY IF EXISTS "dev insert offers" ON public.offers;

CREATE POLICY "Public can view offers" ON public.offers
  FOR SELECT TO anon, authenticated
  USING (true);

-- Admin can manage offers (service role only)
CREATE POLICY "Admin can manage offers" ON public.offers
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Restrict prejoins to create-only for public
DROP POLICY IF EXISTS "Users can view own prejoins" ON prejoins;
DROP POLICY IF EXISTS "Users can create prejoins" ON prejoins;

CREATE POLICY "Public can create prejoins" ON prejoins
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Admin can view all prejoins
CREATE POLICY "Admin can view prejoins" ON prejoins
  FOR SELECT TO service_role
  USING (true);

-- 4. Ensure server_logs is admin-only
DROP POLICY IF EXISTS "Admin can view server logs" ON server_logs;
CREATE POLICY "Admin can view server logs" ON server_logs
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. Ensure mail_templates is admin-only
DROP POLICY IF EXISTS "Admin can manage mail templates" ON public.mail_templates;
CREATE POLICY "Admin can manage mail templates" ON public.mail_templates
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 6. Ensure schedules are properly secured
DROP POLICY IF EXISTS "Schedules public read" ON schedules;
CREATE POLICY "Schedules public read" ON schedules
  FOR SELECT TO anon, authenticated
  USING (share_token IS NOT NULL);

DROP POLICY IF EXISTS "Schedules admin write" ON schedules;
CREATE POLICY "Schedules admin write" ON schedules
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 7. Ensure schedule_items are properly secured
DROP POLICY IF EXISTS "Schedule items public read" ON schedule_items;
CREATE POLICY "Schedule items public read" ON schedule_items
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM schedules s 
      WHERE s.id = schedule_items.schedule_id 
      AND s.share_token IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "Schedule items admin write" ON schedule_items;
CREATE POLICY "Schedule items admin write" ON schedule_items
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 8. Add published column to needs if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'needs' AND column_name = 'published'
  ) THEN
    ALTER TABLE needs ADD COLUMN published BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 9. Create index for published needs
CREATE INDEX IF NOT EXISTS idx_needs_published ON needs(published) WHERE published = true;

-- 10. Update existing needs to be published by default (for migration)
UPDATE needs SET published = true WHERE published IS NULL;

-- Log the migration
INSERT INTO server_logs (level, route, message, meta) 
VALUES (
  'info', 
  'migration', 
  'Security hardening migration applied', 
  '{"migration": "20241220_security_hardening", "tables": ["needs", "offers", "prejoins", "server_logs", "mail_templates", "schedules", "schedule_items"]}'
);
