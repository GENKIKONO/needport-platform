export type NeedMode = 'single' | 'pooled';
export type OfferStatus = 'proposed' | 'adopted' | 'expired';

export type Offer = {
  id: string;
  needId: string;
  min_people: number;         // 最低催行人数（残人数計算はコレのみ）
  max_people?: number | null; // 任意
  deadline: string;           // ISO8601
  price_type: 'fixed' | 'per_person' | 'range';
  price_value: number | { min: number; max: number }; // 円
  note?: string;
  status: OfferStatus;
  providerRef?: string;       // 匿名維持。表示には使わない
  responseTime?: string;      // 応答時刻（ISO8601）
};

export type Need = {
  id: string;
  title: string;
  summary: string;
  body: string;               // 会員のみ全文
  tags: string[];
  area?: string | null;       // 任意
  mode: NeedMode;
  adopted_offer_id?: string | null; // 採用予定オファーが決まるまで null
  prejoin_count: number;      // 参加予約数
  attachments: { id: string; name: string }[];
  scale?: 'personal' | 'community'; // ニーズの種類
  macro_fee_hint?: string | null;   // 会費目安（community時のみ）
  macro_use_freq?: string | null;   // 利用頻度（community時のみ）
  macro_area_hint?: string | null;  // 対象エリア（community時のみ）
};

export type SummaryVersion = {
  id: string;
  needId: string;
  version: number;            // v1, v2, ...
  updatedAt: string;          // ISO8601
  authorRole: 'requester' | 'provider';
  scope_do: string[];         // やること
  scope_dont: string[];       // やらないこと
  deliverables: string[];     // 成果物/検収基準
  milestones: { name: string; due: string }[];
  price_initial: number;      // 一次（着手金 or 全額） 表示のみ
  price_change?: number;      // 二次差額（+なら徴収）
  risks: string[];
  terms: string[];            // 前提/依存
};

export type Room = {
  id: string;
  needId: string;
  participants: { role:'requester'|'provider'|'ops'; nickname:string }[];
  messages: { id:string; sender:string; body:string; ts:string }[]; // 表示のみ
};

export type Membership = {
  isGuest: boolean;
  isUserMember: boolean;
  isProMember: boolean;
};

export type PageState = {
  membership: Membership;
};
