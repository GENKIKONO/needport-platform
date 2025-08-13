-- Add scale column to needs table
ALTER TABLE needs ADD COLUMN IF NOT EXISTS scale TEXT NOT NULL DEFAULT 'personal' CHECK (scale IN ('personal', 'community'));

-- Add macro fields for community scale
ALTER TABLE needs ADD COLUMN IF NOT EXISTS macro_fee_hint TEXT;
ALTER TABLE needs ADD COLUMN IF NOT EXISTS macro_use_freq TEXT;
ALTER TABLE needs ADD COLUMN IF NOT EXISTS macro_area_hint TEXT;

-- Add index for scale filtering
CREATE INDEX IF NOT EXISTS idx_needs_scale ON needs(scale);

-- Add constraint to ensure macro fields are null for personal scale
ALTER TABLE needs ADD CONSTRAINT IF NOT EXISTS check_personal_macro_null 
  CHECK (scale = 'personal' OR (scale = 'community' AND (macro_fee_hint IS NOT NULL OR macro_use_freq IS NOT NULL OR macro_area_hint IS NOT NULL)));

-- Update RLS policies to include scale
DROP POLICY IF EXISTS "Users can view published needs" ON needs;
CREATE POLICY "Users can view published needs" ON needs
  FOR SELECT USING (published = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can insert draft needs" ON needs;
CREATE POLICY "Users can insert draft needs" ON needs
  FOR INSERT WITH CHECK (published = false AND adopted_offer_id IS NULL);

-- Add comment
COMMENT ON COLUMN needs.scale IS 'Type of need: personal (individual) or community (group)';
COMMENT ON COLUMN needs.macro_fee_hint IS 'Fee hint for community needs (max 120 chars)';
COMMENT ON COLUMN needs.macro_use_freq IS 'Usage frequency hint for community needs (max 120 chars)';
COMMENT ON COLUMN needs.macro_area_hint IS 'Area hint for community needs (max 120 chars)';
