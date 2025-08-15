-- NOT auto-applied: B2B スキーマ雛形（Phase 2 で適用予定）
-- このファイルは設計書としてのみ使用。実際の適用は手動で行う。

-- 賛同テーブル
CREATE TABLE IF NOT EXISTS public.endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id UUID NOT NULL REFERENCES public.needs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(need_id, user_id)
);

-- 提案テーブル
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id UUID NOT NULL REFERENCES public.needs(id) ON DELETE CASCADE,
  proposer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget INTEGER NOT NULL CHECK (budget > 0),
  timeline_days INTEGER NOT NULL CHECK (timeline_days > 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 契約テーブル
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (end_date > start_date)
);

-- エスクローテーブル
CREATE TABLE IF NOT EXISTS public.escrows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'funded', 'released', 'refunded')),
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- レビューテーブル
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_endorsements_need_id ON public.endorsements(need_id);
CREATE INDEX IF NOT EXISTS idx_proposals_need_id ON public.proposals(need_id);
CREATE INDEX IF NOT EXISTS idx_proposals_proposer_id ON public.proposals(proposer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_proposal_id ON public.contracts(proposal_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON public.contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_provider_id ON public.contracts(provider_id);
CREATE INDEX IF NOT EXISTS idx_escrows_contract_id ON public.escrows(contract_id);
CREATE INDEX IF NOT EXISTS idx_reviews_contract_id ON public.reviews(contract_id);

-- RLS ポリシー（後で実装）
-- ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.escrows ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 更新トリガー（後で実装）
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = NOW();
--   RETURN NEW;
-- END;
-- $$ language 'plpgsql';

-- CREATE TRIGGER update_endorsements_updated_at BEFORE UPDATE ON public.endorsements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON public.proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- CREATE TRIGGER update_escrows_updated_at BEFORE UPDATE ON public.escrows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
