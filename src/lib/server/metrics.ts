// server-only の安全ラッパー。テーブルが無ければ静かにスキップ。
import 'server-only'
import { createClient } from '@/lib/supabase/server'

type Pageview = { path: string; count: number }

export async function getPageviewsSafe(): Promise<{ ok: boolean; data: Pageview[] }> {
  // ビルド時に完全停止したいとき用（vercel-build で DISABLE_METRICS=1 にも対応）
  if (process.env.DISABLE_METRICS === '1') {
    return { ok: false, data: [] }
  }
  try {
    const sb = createClient()
    const { data, error } = await sb.from('pageviews').select('path, count').limit(1000)
    if (error) {
      // テーブル未作成など（PGRST205）を静かに握りつぶす
      // ※ 本番ではログを出さない
      if (process.env.NODE_ENV !== 'production') {
        // dev だけ軽く warn（error は使わない）
        console.warn('[pageviews:safe]', error.code ?? error.message)
      }
      return { ok: false, data: [] }
    }
    return { ok: true, data: (data as Pageview[]) ?? [] }
  } catch (e: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[pageviews:caught]', e?.message ?? e)
    }
    return { ok: false, data: [] }
  }
}
