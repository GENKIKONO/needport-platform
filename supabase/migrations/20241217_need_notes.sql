-- Create need_notes table for admin internal notes
CREATE TABLE public.need_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id uuid NOT NULL REFERENCES public.needs(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create index for performance
CREATE INDEX idx_need_notes_need_id ON public.need_notes(need_id);
CREATE INDEX idx_need_notes_created_at ON public.need_notes(created_at);

-- Enable RLS (admin only access)
ALTER TABLE public.need_notes ENABLE ROW LEVEL SECURITY;
