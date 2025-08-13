import { supabaseServer } from './supabase-server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type NeedCardRow = {
  id: string;
  title: string;
  summary: string | null;
  mode: string | null;
  prejoin_count: number | null;
  min_people: number | null;
  deadline: string | null;
  price_amount: number | null;
  offer_status: string | null;
  remaining: number | null;
  created_at?: string;
};

export async function fetchNeedCards(limit = 12): Promise<NeedCardRow[]> {
  const sb = supabaseServer();
  const r = await sb.from('need_cards')
    .select('id,title,summary,mode,prejoin_count,min_people,deadline,price_amount,offer_status,remaining,created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (r.error) throw r.error;
  return (r.data ?? []) as any;
}

export type AdminRow = {
  id: string;
  title: string;
  prejoin_count: number | null;
  min_people?: number | null;
  remaining?: number | null;
  deadline?: string | null;
  price_amount?: number | null;
};

export async function fetchAdminNeeds(limit = 50): Promise<AdminRow[]> {
  const sb = supabaseServer();
  // まず need_cards を試す
  try {
    const r = await sb.from('need_cards')
      .select('id,title,prejoin_count,min_people,remaining,deadline,price_amount')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (!r.error && r.data) return r.data as any;
  } catch (_) {}
  // フォールバック: needs 単体
  const n = await sb.from('needs')
    .select('id,title,prejoin_count,created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (n.error) throw n.error;
  return (n.data ?? []).map((x:any) => ({
    id: x.id, title: x.title, prejoin_count: x.prejoin_count ?? 0
  }));
}

// DB行の最小プロジェクション
export type NeedRow = {
  id: string;
  title: string;
  summary: string;
  prejoin_count?: number | null;
  min_people?: number | null;
  price_amount?: number | null;
  deadline?: string | null;
  created_at?: string | null;
  published?: boolean;
  scale?: 'personal' | 'community';
  macro_fee_hint?: string | null;
  macro_use_freq?: string | null;
  macro_area_hint?: string | null;
};

// サーバー用クライアント（存在する場合はそれを使う）
function getSb(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY が未設定です');
  return createClient(url, anon);
}

// モックの最小変換（型エラーにならない範囲で安全に詰め替え）
import mockData from '../mock/data.json' assert { type: 'json' };
function mockToNeeds(): NeedRow[] {
  const arr = Array.isArray(mockData?.needs) ? mockData.needs : [];
  return arr.map((m: any, i: number) => ({
    id: String(m.id ?? m.slug ?? `mock-${i}`),
    title: String(m.title ?? '（タイトル未設定）'),
    summary: String(m.summary ?? m.description ?? ''),
    prejoin_count: Number(m.prejoin_count ?? m.joined ?? 0),
    min_people: m.min_people ?? m.minPeople ?? null,
    price_amount: m.price_amount ?? m.price ?? null,
    deadline: m.deadline ?? null,
    created_at: m.created_at ?? null,
    published: true, // モックデータは公開済みとして扱う
  }));
}

export async function fetchNeedsForList(): Promise<{ source: 'need_cards' | 'needs' | 'mock'; items: NeedRow[] }> {
  const sb = getSb();

  // 1) ビュー優先
  try {
    const { data, error } = await sb.from('need_cards')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(30);
    if (!error && data && data.length) return { source: 'need_cards', items: data as NeedRow[] };
  } catch { /* noop */ }

  // 2) テーブル
  try {
    const { data, error } = await sb
      .from('needs')
      .select('id,title,summary,prejoin_count,min_people,price_amount,deadline,created_at,published')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(30);
    if (!error && data && data.length) return { source: 'needs', items: data as NeedRow[] };
  } catch { /* noop */ }

  // 3) モック
  return { source: 'mock', items: mockToNeeds() };
}

export async function fetchNeedById(id: string): Promise<NeedRow | null> {
  const sb = getSb();

  // 1) ビュー優先
  try {
    const { data, error } = await sb.from('need_cards')
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .single();
    if (!error && data) return data as NeedRow;
  } catch { /* noop */ }

  // 2) テーブル
  try {
    const { data, error } = await sb
      .from('needs')
      .select('id,title,summary,prejoin_count,min_people,price_amount,deadline,created_at,published')
      .eq('id', id)
      .eq('published', true)
      .single();
    if (!error && data) return data as NeedRow;
  } catch { /* noop */ }

  // 3) 無ければ null
  return null;
}
