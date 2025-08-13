-- Add soft delete columns
ALTER TABLE public.needs ADD COLUMN deleted_at timestamptz;
ALTER TABLE public.offers ADD COLUMN deleted_at timestamptz;

-- Create partial indexes for performance
CREATE INDEX idx_needs_not_deleted ON public.needs(created_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_offers_not_deleted ON public.offers(need_id, created_at) WHERE deleted_at IS NULL;

-- Update existing queries to filter out soft-deleted records
-- (This will be handled in the application code)
