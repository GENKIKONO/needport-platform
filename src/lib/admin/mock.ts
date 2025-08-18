import { type NeedRow, type NeedDetail, type AdminStats, type Stage } from "./types";

const stages: Stage[] = ["posted","gathering","proposed","approved","room","in_progress","completed","disputed","refunded"];

const now = Date.now();
const rand = (min:number,max:number)=> Math.floor(Math.random()*(max-min+1))+min;

export function seedNeeds(): NeedDetail[] {
  return [
    {
      id: "need_1",
      title: "Webサイトリニューアル",
      body: "企業のWebサイトをモダンなデザインにリニューアルしたい。レスポンシブ対応必須。",
      ownerMasked: "企業A",
      stage: "posted",
      supporters: 5,
      proposals: 3,
      estimateYen: 500000,
      isPublished: true,
      isSample: false,
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
      version: 1,
    },
    {
      id: "need_2", 
      title: "ECサイト構築",
      body: "オンラインショップの構築。決済機能、在庫管理、顧客管理機能が必要。",
      ownerMasked: "企業B",
      stage: "gathering",
      supporters: 8,
      proposals: 5,
      estimateYen: 800000,
      isPublished: true,
      isSample: false,
      createdAt: "2024-01-10T09:00:00Z",
      updatedAt: "2024-01-12T14:30:00Z",
      version: 1,
    },
    {
      id: "need_3",
      title: "モバイルアプリ開発",
      body: "iOS/Android対応のモバイルアプリ。位置情報機能とプッシュ通知が必要。",
      ownerMasked: "スタートアップC",
      stage: "proposed",
      supporters: 12,
      proposals: 7,
      estimateYen: 1200000,
      isPublished: true,
      isSample: false,
      createdAt: "2024-01-05T11:00:00Z",
      updatedAt: "2024-01-08T16:45:00Z",
      version: 1,
    },
    {
      id: "need_4",
      title: "業務システム開発",
      body: "社内の業務効率化のためのシステム開発。在庫管理、売上管理、レポート機能。",
      ownerMasked: "製造業D",
      stage: "approved",
      supporters: 3,
      proposals: 2,
      estimateYen: 2000000,
      isPublished: false,
      isSample: true,
      createdAt: "2024-01-01T08:00:00Z",
      updatedAt: "2024-01-03T13:20:00Z",
      version: 1,
    },
    {
      id: "need_5",
      title: "データ分析システム",
      body: "ビッグデータの分析と可視化システム。機械学習機能も含む。",
      ownerMasked: "IT企業E",
      stage: "room",
      supporters: 15,
      proposals: 9,
      estimateYen: 3000000,
      isPublished: true,
      isSample: false,
      createdAt: "2023-12-28T10:30:00Z",
      updatedAt: "2023-12-30T15:10:00Z",
      version: 1,
    },
  ];
}

export function toRows(needs: NeedDetail[]): NeedRow[] {
  return needs.map(n => ({
    id: n.id,
    title: n.title,
    ownerMasked: n.ownerMasked,
    stage: n.stage,
    supporters: n.supporters,
    proposals: n.proposals,
    estimateYen: n.estimateYen,
    isPublished: n.isPublished,
    isSample: n.isSample,
    updatedAt: n.updatedAt,
  }));
}

export function calcStats(all: NeedDetail[]): AdminStats {
  const byStage = stages.reduce((acc:any,k)=> (acc[k]=0, acc), {} as Record<Stage,number>);
  let sum = 0, cnt = 0, pendingApprovals = 0, pendingPayouts = 0;
  for (const n of all) {
    byStage[n.stage]++; 
    if (n.estimateYen) { sum += n.estimateYen; cnt++; }
    if (n.stage === "proposed") pendingApprovals++;
    if (n.payment === "escrow_hold") pendingPayouts++;
  }
  return {
    byStage,
    grossYen: sum,
    avgTicketYen: cnt ? Math.round(sum/cnt) : 0,
    pendingApprovals,
    pendingPayouts
  }
}
