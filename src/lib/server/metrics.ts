import { createClient } from "@/lib/supabase/server";

type Row = { path: string; pv: number };

export async function getPageviewsSafe(): Promise<{ ok: boolean; data?: Row[]; error?: string }> {
  try {
    const sb = createClient();
    const { data, error } = await sb
      .from("pageviews")
      .select("path,pv")
      .order("pv", { ascending: false })
      .limit(10);

    if (error) {
      // テーブル無し（PGRST205）や権限不足でもページは落とさない・ログらない
      return { ok: false, error: `${error.code ?? "ERR"}: ${error.message}` };
    }
    return { ok: true, data: (data ?? []) as Row[] };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "unknown error" };
  }
}
