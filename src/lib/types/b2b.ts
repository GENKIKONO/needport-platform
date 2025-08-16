// B2B 関連の型定義

export interface Endorsement {
  id: string;
  needId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id: string;
  needId: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  status: 'draft' | 'submitted' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  id: string;
  proposalId: string;
  needId: string;
  clientId: string;
  providerId: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  amount: number;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Escrow {
  id: string;
  contractId: string;
  amount: number;
  status: 'pending' | 'funded' | 'released' | 'refunded';
  fundedAt?: string;
  releasedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  contractId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface B2BApiResponse {
  ok: boolean;
  error?: string;
  data?: any;
}

// UI内部用のダミー型（実データとは混同しない）
export type EndorsementPreview = { 
  needId: string; 
  demoCount: number;
  // 注意: これは実データではなく、UI表示用のダミー値です
};
