import { createClient } from "@/lib/supabase/server";

type Row = { path: string; pv: number };

export async function getPageviewsSafe(): Promise<{ ok: boolean; data?: Row[]; error?: string }> {
  try {
    const sb = createClient();
    // テーブルが無い環境では PGRST205 になるので try/catch
    const { data, error } = await sb
      .from("pageviews")
      .select("path,pv")
      .order("pv", { ascending: false })
      .limit(10);

    if (error) {
      // テーブル無し（PGRST205）などは静かにスキップ
      if (error.code === "PGRST205") {
        return { ok: false, error: `${error.code}: ${error.message}` };
      }
      // それ以外のエラーもページを落とさない
      return { ok: false, error: `${error.code ?? "ERR"}: ${error.message}` };
    }

    return { ok: true, data: (data ?? []) as Row[] };
  } catch (e: any) {
    // ランタイム/型定義等での例外も握りつぶしてページ継続
    return { ok: false, error: e?.message ?? "unknown error" };
  }
}
