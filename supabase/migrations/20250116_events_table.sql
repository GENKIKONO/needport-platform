-- Create events table for granular event tracking
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor TEXT NOT NULL,
  type TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_events_actor ON events(actor);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_actor_type ON events(actor, type);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Admin can read all events
CREATE POLICY "admin_read_events" ON events
  FOR SELECT TO authenticated
  USING (true);

-- Only system can insert events (via service role)
CREATE POLICY "system_insert_events" ON events
  FOR INSERT TO authenticated
  WITH CHECK (true);
