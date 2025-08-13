-- Create pageviews table for analytics
CREATE TABLE public.pageviews (
  path text NOT NULL,
  day date NOT NULL,
  views integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (path, day)
);

-- Create index for performance
CREATE INDEX idx_pageviews_path_day ON public.pageviews(path, day);
CREATE INDEX idx_pageviews_day ON public.pageviews(day);

-- Enable RLS (optional, for future use)
ALTER TABLE public.pageviews ENABLE ROW LEVEL SECURITY;
