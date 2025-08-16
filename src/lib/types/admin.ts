export type AdminStatus = 'demo' | 'pending' | 'approved' | 'rejected' | 'archived';

export type AdminProject = {
  id: string;
  title: string;
  ownerName: string;
  category?: string;
  status: AdminStatus; // demo/pending/...（UI用）
  isDemo: boolean;
  createdAt: string;   // ISO
  updatedAt?: string;  // ISO
  comments: { id: string; author: string; body: string; at: string }[];
};
