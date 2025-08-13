-- Add status column to needs table for moderation
ALTER TABLE public.needs 
ADD COLUMN status text NOT NULL DEFAULT 'draft' 
CHECK (status IN ('draft', 'pending', 'published', 'archived'));

-- Create partial index for performance
CREATE INDEX idx_needs_status_created_at 
ON public.needs(status, created_at) 
WHERE status = 'published';

-- Update existing needs to be published by default
UPDATE public.needs SET status = 'published' WHERE status = 'draft';
