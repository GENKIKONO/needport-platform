-- Create attachments table
CREATE TABLE public.attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id uuid NOT NULL REFERENCES public.needs(id) ON DELETE CASCADE,
  path text NOT NULL,
  name text NOT NULL,
  size integer,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_attachments_need_id ON public.attachments(need_id);
CREATE INDEX idx_attachments_created_at ON public.attachments(created_at);

-- Enable RLS (admin only)
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
