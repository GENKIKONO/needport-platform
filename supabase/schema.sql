-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('user', 'pro', 'ops', 'mod', 'admin')) DEFAULT 'user',
  stripe_customer_id TEXT,
  stripe_account_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Needs table
CREATE TABLE needs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  area TEXT,
  mode TEXT CHECK (mode IN ('single', 'pooled')) DEFAULT 'single',
  adopted_offer_id UUID,
  prejoin_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1) テーブル本体
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id UUID NOT NULL REFERENCES public.needs(id) ON DELETE CASCADE,
  vendor_name TEXT,
  amount INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) RLS（開発用の緩いポリシー：本番は閉じます）
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dev read offers" ON public.offers;
CREATE POLICY "dev read offers"
  ON public.offers FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "dev insert offers" ON public.offers;
CREATE POLICY "dev insert offers"
  ON public.offers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 3) パフォーマンス用インデックス
CREATE INDEX IF NOT EXISTS idx_offers_need_id ON public.offers(need_id);

-- 4) Supabase RESTのスキーマ再読み込み（任意）
NOTIFY pgrst, 'reload schema';

-- Prejoins table
CREATE TABLE prejoins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  need_id UUID REFERENCES needs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  status TEXT CHECK (status IN ('setup', 'confirmed', 'failed', 'canceled')) DEFAULT 'setup',
  setup_intent_id TEXT,
  payment_method_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint to prevent duplicate prejoins
CREATE UNIQUE INDEX idx_prejoins_unique_user_need ON prejoins(user_id, need_id);

-- Rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  need_id UUID REFERENCES needs(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Room participants table
CREATE TABLE room_participants (
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  role TEXT CHECK (role IN ('requester', 'provider', 'ops')),
  PRIMARY KEY (room_id, user_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  body TEXT NOT NULL,
  body_masked TEXT,
  flags JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attachments table
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  file_key TEXT NOT NULL,
  mime TEXT NOT NULL,
  size INTEGER NOT NULL,
  sanitized BOOLEAN DEFAULT FALSE,
  has_pii BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Summaries table
CREATE TABLE summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  need_id UUID REFERENCES needs(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  author_role TEXT CHECK (author_role IN ('requester', 'provider')) NOT NULL,
  scope_do TEXT[] DEFAULT '{}',
  scope_dont TEXT[] DEFAULT '{}',
  deliverables TEXT[] DEFAULT '{}',
  milestones JSONB DEFAULT '[]',
  price_initial INTEGER NOT NULL,
  price_change INTEGER,
  risks TEXT[] DEFAULT '{}',
  terms TEXT[] DEFAULT '{}'
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  need_id UUID REFERENCES needs(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('initial', 'change')) NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'jpy',
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memberships table
CREATE TABLE memberships (
  user_id UUID PRIMARY KEY REFERENCES profiles(id),
  tier TEXT CHECK (tier IN ('guest', 'user', 'pro')) DEFAULT 'guest',
  active BOOLEAN DEFAULT FALSE,
  current_period_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public comments table
CREATE TABLE comments_public (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  need_id UUID REFERENCES needs(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_needs_created_by ON needs(created_by);
CREATE INDEX idx_needs_adopted_offer_id ON needs(adopted_offer_id);
CREATE INDEX idx_offers_need_id ON offers(need_id);
CREATE INDEX idx_offers_provider_id ON offers(provider_id);
CREATE INDEX idx_prejoins_need_id ON prejoins(need_id);
CREATE INDEX idx_prejoins_user_id ON prejoins(user_id);
CREATE INDEX idx_rooms_need_id ON rooms(need_id);
CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_attachments_room_id ON attachments(room_id);
CREATE INDEX idx_summaries_need_id ON summaries(need_id);
CREATE INDEX idx_payments_need_id ON payments(need_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX idx_comments_public_need_id ON comments_public(need_id);
CREATE INDEX idx_comments_public_status ON comments_public(status);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE prejoins ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments_public ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: 本人のみ読み書き可能
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Needs: 公開読み取り、作成者のみ更新
CREATE POLICY "Anyone can view needs" ON needs
  FOR SELECT USING (true);

CREATE POLICY "Users can create needs" ON needs
  FOR INSERT WITH CHECK (created_by = (SELECT id FROM profiles WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "Creators can update needs" ON needs
  FOR UPDATE USING (created_by = (SELECT id FROM profiles WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'));

-- adopted_offer_id は ops/admin のみ更新可能
CREATE POLICY "Ops can update adopted_offer_id" ON needs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role IN ('ops', 'admin')
    )
  );



-- Prejoins: 参加者のみ読み書き
CREATE POLICY "Users can view own prejoins" ON prejoins
  FOR SELECT USING (user_id = (SELECT id FROM profiles WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "Users can create prejoins" ON prejoins
  FOR INSERT WITH CHECK (user_id = (SELECT id FROM profiles WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'));

-- Rooms: 参加者のみ読み書き
CREATE POLICY "Participants can view rooms" ON rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_participants rp
      JOIN profiles p ON rp.user_id = p.id
      WHERE rp.room_id = rooms.id
      AND p.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Room participants: 参加者のみ読み取り、ops/admin のみ追加
CREATE POLICY "Participants can view room participants" ON room_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_participants rp
      JOIN profiles p ON rp.user_id = p.id
      WHERE rp.room_id = room_participants.room_id
      AND p.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "Ops can manage room participants" ON room_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role IN ('ops', 'admin')
    )
  );

-- Messages: 参加者のみ読み書き
CREATE POLICY "Participants can view messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_participants rp
      JOIN profiles p ON rp.user_id = p.id
      WHERE rp.room_id = messages.room_id
      AND p.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "Participants can create messages" ON messages
  FOR INSERT WITH CHECK (sender_id = (SELECT id FROM profiles WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'));

-- Attachments: 参加者のみ読み書き
CREATE POLICY "Participants can view attachments" ON attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_participants rp
      JOIN profiles p ON rp.user_id = p.id
      WHERE rp.room_id = attachments.room_id
      AND p.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "Participants can create attachments" ON attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM room_participants rp
      JOIN profiles p ON rp.user_id = p.id
      WHERE rp.room_id = attachments.room_id
      AND p.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Summaries: 関連needの参加者のみ読み取り、参加者のみ作成
CREATE POLICY "Participants can view summaries" ON summaries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_participants rp
      JOIN profiles p ON rp.user_id = p.id
      JOIN rooms r ON rp.room_id = r.id
      WHERE r.need_id = summaries.need_id
      AND p.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "Participants can create summaries" ON summaries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM room_participants rp
      JOIN profiles p ON rp.user_id = p.id
      JOIN rooms r ON rp.room_id = r.id
      WHERE r.need_id = summaries.need_id
      AND p.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Payments: 関連needの参加者のみ読み取り
CREATE POLICY "Participants can view payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_participants rp
      JOIN profiles p ON rp.user_id = p.id
      JOIN rooms r ON rp.room_id = r.id
      WHERE r.need_id = payments.need_id
      AND p.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Memberships: 本人のみ読み取り
CREATE POLICY "Users can view own membership" ON memberships
  FOR SELECT USING (user_id = (SELECT id FROM profiles WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'));

-- Audit logs: ops/admin のみ読み取り
CREATE POLICY "Ops can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role IN ('ops', 'admin')
    )
  );

-- Public comments: 承認済みのみ公開読み取り
CREATE POLICY "Anyone can view approved comments" ON comments_public
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can create comments" ON comments_public
  FOR INSERT WITH CHECK (created_by = (SELECT id FROM profiles WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'));

-- Mods can moderate comments
CREATE POLICY "Mods can moderate comments" ON comments_public
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role IN ('mod', 'admin')
    )
  );

-- Storage bucket for attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', false);

-- Storage policies for attachments
CREATE POLICY "Participants can upload attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'attachments' AND
    EXISTS (
      SELECT 1 FROM room_participants rp
      JOIN profiles p ON rp.user_id = p.id
      WHERE rp.room_id::text = (storage.foldername(name))[1]
      AND p.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "Participants can view attachments" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'attachments' AND
    EXISTS (
      SELECT 1 FROM room_participants rp
      JOIN profiles p ON rp.user_id = p.id
      WHERE rp.room_id::text = (storage.foldername(name))[1]
      AND p.clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Function to update prejoin count
CREATE OR REPLACE FUNCTION update_prejoin_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE needs 
    SET prejoin_count = prejoin_count + 1
    WHERE id = NEW.need_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE needs 
    SET prejoin_count = GREATEST(prejoin_count - 1, 0)
    WHERE id = OLD.need_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update prejoin_count
CREATE TRIGGER trigger_update_prejoin_count
  AFTER INSERT OR DELETE ON prejoins
  FOR EACH ROW
  EXECUTE FUNCTION update_prejoin_count();

-- seed（重複実行しても安全）
insert into public.needs (title, summary, body)
values ('デバッグ用ニーズ', '要約', '本文')
on conflict do nothing;

insert into public.offers (need_id, vendor_name, amount)
select n.id, 'テスト企業', 500000
from public.needs n
where n.title = 'デバッグ用ニーズ'
on conflict do nothing;



-- ---- need_cards view ----
create or replace view public.need_cards as
select
  n.id,
  n.title,
  n.summary,
  n.mode,
  n.prejoin_count,
  o.amount,
  n.created_at,
  0 as remaining
from public.needs n
left join public.offers o
  on o.need_id = n.id;

-- Mail templates table
CREATE TABLE IF NOT EXISTS public.mail_templates (
  name text PRIMARY KEY,
  subject text NOT NULL,
  html text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default templates
INSERT INTO public.mail_templates (name, subject, html) VALUES
('welcome', 'NeedPortへようこそ', '<h1>NeedPortへようこそ</h1><p>アカウントが作成されました。</p>'),
('notification', '新しい通知があります', '<h1>新しい通知</h1><p>{{message}}</p>'),
('adopted_offer', 'オファーが採用されました', '<h1>オファー採用</h1><p>あなたのオファーが採用されました。</p>')
ON CONFLICT (name) DO NOTHING;

-- RLS for mail templates (admin only)
ALTER TABLE public.mail_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage mail templates" ON public.mail_templates
  FOR ALL USING (auth.role() = 'service_role');

-- Schedule tables
CREATE TABLE IF NOT EXISTS public.schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id uuid NOT NULL REFERENCES needs(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '進行スケジュール',
  share_token text UNIQUE,
  status text CHECK (status IN ('draft', 'active', 'archived')) DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.schedule_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_date date,
  due_date date,
  status text CHECK (status IN ('planned', 'in_progress', 'done', 'blocked')) DEFAULT 'planned',
  order_index integer DEFAULT 0,
  assignee text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_schedule_items_schedule_id_order ON schedule_items(schedule_id, order_index);
CREATE INDEX IF NOT EXISTS idx_schedules_need_id ON schedules(need_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_items_updated_at BEFORE UPDATE ON schedule_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_items ENABLE ROW LEVEL SECURITY;

-- Schedules: select for all when share_token is not null, write for service-role only
CREATE POLICY "Schedules public read" ON schedules
  FOR SELECT USING (share_token IS NOT NULL);

CREATE POLICY "Schedules admin write" ON schedules
  FOR ALL USING (auth.role() = 'service_role');

-- Schedule items: select allowed via join from schedules, write for service-role only
CREATE POLICY "Schedule items public read" ON schedule_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM schedules 
      WHERE schedules.id = schedule_items.schedule_id 
      AND schedules.share_token IS NOT NULL
    )
  );

CREATE POLICY "Schedule items admin write" ON schedule_items
  FOR ALL USING (auth.role() = 'service_role');
