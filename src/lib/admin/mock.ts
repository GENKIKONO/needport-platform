import { type NeedRow, type NeedDetail, type AdminStats, type Stage } from "./types";

const stages: Stage[] = ["posted","gathering","proposed","approved","room","in_progress","completed","disputed","refunded"];

const now = Date.now();
const rand = (min:number,max:number)=> Math.floor(Math.random()*(max-min+1))+min;

export function seedNeeds(): NeedDetail[] {
  return Array.from({length:50}).map((_,i)=> {
    const stage = stages[rand(0,5)]; // まずは早い段階中心
    const yen = [0, 5000, 12000, 30000, 80000, 150000][rand(0,5)];
    const id = `N${String(i+1).padStart(4,"0")}`;
    return {
      id,
      title: `ニーズ ${i+1}`,
      ownerMasked: `u***${rand(10,99)}`,
      stage,
      supporters: rand(0, 25),
      proposals: rand(0, 5),
      estimateYen: yen,
      createdAt: new Date(now - rand(1,40)*86400000).toISOString(),
      updatedAt: new Date(now - rand(0,5)*86400000).toISOString(),
      payment: ["none","escrow_hold","released","refunded"][rand(0,3)] as any,
      trust: {
        anchorName: Math.random() > 0.5 ? ["紹介A","紹介B","紹介C"][rand(0,2)] : undefined,
        anchorReputation: rand(55,95),
        expertVerified: Math.random() > 0.6,
        creditHold: Math.random() > 0.85
      },
      events: [
        { type:"stage_changed", needId:id, from:"posted", to:stage, at:new Date(now - rand(1,10)*86400000).toISOString() }
      ]
    }
  });
}

export function toRows(details: NeedDetail[]): NeedRow[] {
  return details.map(d => ({
    id: d.id,
    title: d.title,
    ownerMasked: d.ownerMasked,
    stage: d.stage,
    supporters: d.supporters,
    proposals: d.proposals,
    estimateYen: d.estimateYen,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    payment: d.payment,
    trust: d.trust
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
