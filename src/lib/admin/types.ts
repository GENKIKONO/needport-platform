export type Stage =
  | "posted"            // 投稿
  | "gathering"         // 賛同集め
  | "proposed"          // 提案受領
  | "approved"          // 承認済み（採択）
  | "room"              // ルーム進行中
  | "in_progress"       // 作業実行中
  | "completed"         // 完了・納品
  | "disputed"          // 異議
  | "refunded";         // 返金

export type PaymentStatus = "none" | "escrow_hold" | "released" | "refunded";

export type TrustFlag = {
  anchorName?: string;           // 紹介者（任意）
  anchorReputation?: number;     // 0-100
  expertVerified?: boolean;      // 専門家チェック済み
  creditHold?: boolean;          // 運営保留
};

export type NeedRow = {
  id: string;
  title: string;
  ownerMasked: string;           // 例: "u***53"
  ownerUserId?: string;          // 投稿ユーザID
  stage: Stage;
  supporters: number;
  proposals: number;
  estimateYen?: number;          // 想定金額（JPY）
  isPublished: boolean;
  isSample: boolean;
  createdAt: string;             // ISO
  updatedAt: string;             // ISO
  payment: PaymentStatus;
  trust: TrustFlag;
};

export type AdminStats = {
  byStage: Record<Stage, number>;
  grossYen: number;
  avgTicketYen: number;
  pendingApprovals: number;      // 承認待ち件数
  pendingPayouts: number;        // 支払い保留件数
  events: AdminEvent[];          // 最近のイベント
};

export type AdminEventLegacy =
  | { type:"stage_changed"; needId:string; from:Stage; to:Stage; at:string }
  | { type:"expert_requested"; needId:string; at:string }
  | { type:"escrow_frozen"; needId:string; at:string }
  | { type:"note"; needId:string; text:string; at:string };

export type NeedDetail = {
  id: string;
  title: string;
  body?: string;
  ownerMasked: string;
  stage: Stage;
  supporters: number;
  proposals: number;
  estimateYen?: number;
  expert?: { status: "approved" | "rejected" | "pending"; at: string };
  escrowHold?: boolean;
  isSample?: boolean;
  isPublished?: boolean;
  requireIntro?: boolean; // 追加: このニーズは「紹介必須」
  ownerUserId?: string;   // 追加: 投稿ユーザID（暫定）
  views?: number;         // 既存なら維持
  createdAt: string;
  updatedAt: string;
  version?: number;
};

export type AdminEvent = {
  type: string;
  id: string;
  by: string;
  at: string;
  payload?: any;
};
