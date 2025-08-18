export type TrustEventType = "referral_accept" | "endorse_user" | "endorse_need" | "penalty_dispute";

export type ReferralToken = {
  token: string;
  referrerId: string;      // 紹介者（ユーザ or 管理者ID "admin" でもOK）
  expiresAt?: string;      // ISO
  createdAt: string;
  usedBy?: string;         // 使ったユーザID
};

export type UserProfile = {
  id: string;              // "u_xxx"
  name?: string;
  email?: string;
  referrerId?: string;     // 誰から紹介されたか
  createdAt: string;
  updatedAt: string;
  stats: {
    endorsements: number;  // 管理/紹介者からの推薦件数
    completedNeeds: number;
    disputes: number;
  };
};

export type TrustScore = {
  value: number;           // 0-100目安
  bands: "low" | "mid" | "high";
  breakdown: Record<string, number>;
};
