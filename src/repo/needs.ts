export type NeedStatus = "active" | "archived" | "completed";
export type Need = {
  id: string;
  title: string;
  category: string;
  region: string;
  updated_at: string;
  proposals: number;
  status: NeedStatus;
  surfaced_until?: string | null;
  float_score?: number;
};

export type ListParams = {
  q?: string; region?: string; category?: string; price?: string;
  scope?: "all"|"archived"|"active";
  sort?: "new"|"popular"|"due";
  page?: number; pageSize?: number;
};

export async function listNeeds(params: ListParams): Promise<{items: Need[]; hasMore: boolean}>{
  // TODO: Supabaseに繋ぐ。ここは暫定ダミー
  const demo: Need[] = [
    { id:"1", title:"自宅にサウナ設置", category:"リフォーム", region:"港区", updated_at:new Date().toISOString(), proposals:3, status:"active" },
    { id:"2", title:"結婚式で介護タクシー", category:"移動支援", region:"新宿区", updated_at:new Date().toISOString(), proposals:1, status:"archived", surfaced_until:null, float_score:8 },
  ];
  // scopeフィルタ（仮）
  const scope = params.scope ?? "all";
  const filtered = demo.filter(d => scope==="all" ? true : d.status===scope);
  return { items: filtered, hasMore:false };
}
