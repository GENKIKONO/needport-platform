export type TrustEventType = "referral_accept" | "endorse_user" | "endorse_need" | "penalty_dispute";

export type ReferralToken = {
  token: string;
  referrerId: string;      // Referrer (user or admin ID "admin")
  expiresAt?: string;      // ISO
  createdAt: string;
  usedBy?: string;         // User ID who used it
};

export type ReferralInvite = {
  id: string;         // uuid
  needId?: string;    // 紐付け先ニーズ（任意）
  url: string;        // 招待URL
  createdAt: string;  // ISO
};

export type UserProfile = {
  id: string;              // "u_xxx"
  name?: string;
  email?: string;
  referrerId?: string;     // Who referred this user
  createdAt: string;
  updatedAt: string;
  stats: {
    endorsements: number;  // Number of endorsements from admin/referrers
    completedNeeds: number;
    disputes: number;
  };
};

export type TrustScore = {
  value: number;           // 0-100 scale
  bands: "low" | "mid" | "high";
  breakdown: Record<string, number>;
};
