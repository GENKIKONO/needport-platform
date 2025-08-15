// B2B 型定義（Phase 1: 雛形のみ）

export interface Endorsement {
  id: string;
  need_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  need_id: string;
  proposer_id: string;
  title: string;
  description: string;
  budget: number;
  timeline_days: number;
  status: 'draft' | 'submitted' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  proposal_id: string;
  client_id: string;
  provider_id: string;
  title: string;
  description: string;
  amount: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface Escrow {
  id: string;
  contract_id: string;
  amount: number;
  status: 'pending' | 'funded' | 'released' | 'refunded';
  stripe_payment_intent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  contract_id: string;
  reviewer_id: string;
  rating: number; // 1-5
  comment: string;
  created_at: string;
  updated_at: string;
}

// API レスポンス型
export interface B2BApiResponse {
  ok: boolean;
  todo?: string;
  error?: string;
  data?: any;
}
