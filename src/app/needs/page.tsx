// src/app/needs/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import EngagementButtons from "@/components/EngagementButtons";

// 既存の identity があれば優先、なければフォールバック
let IDENTITY: { SEA_PATH: string };
try {
  // Nodeランタイム前提（force-dynamic）。存在しない場合はfallbackへ。
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  IDENTITY = require("@/config/identity").IDENTITY;
} catch {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  IDENTITY = require("@/config/identity.fallback").IDENTITY;
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ニーズ一覧 | NeedPort",
  // ダブルクォート内の「"埋もれた声"」が崩れていたので修正（バッククォートを使用）
  description: `地域や暮らしの「埋もれた声」を一覧で。検索・絞り込み・海中（保管庫）も対応。`,
};

type NeedRow = {
  id: string;
  title: string;
  category: string;
  region: string;
  updatedAt: string; // ISO
  proposals: number;
  status: "active" | "archived" | "completed" | "surfaced";
  maskedPII?: string; // 伏字の一例（未解放時）
};

// ---- 実際のSupabaseデータ取得 ----
async function fetchNeedsSSR({
  q = "",
  region = "",
  category = "",
  price = "",
  sort = "new",
  scope = "all",
  page = 1,
  pageSize = 12,
}: {
  q?: string;
  region?: string;
  category?: string;
  price?: string;
  sort?: "new" | "popular" | "due";
  scope?: "all" | "active" | "archived";
  page?: number;
  pageSize?: number;
}): Promise<{
  items: NeedRow[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}> {
  try {
    // APIから実際のデータを取得
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/needs`, {
      cache: 'no-store' // 常に最新データを取得
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch needs');
    }
    
    const { needs } = await response.json();
    
    // データをNeedRow形式に変換
    let processedNeeds: NeedRow[] = needs.map((need: any) => ({
      id: need.id,
      title: need.title,
      category: need.category || "未分類",
      region: need.region || "未設定",
      updatedAt: need.updated_at || need.created_at,
      proposals: 0, // TODO: 提案数のカウントを実装
      status: need.status === "published" ? "active" : "archived",
      maskedPII: need.pii_email || need.pii_phone || need.pii_address ? "個人情報は提案後に表示" : undefined,
    }));
    
    // フィルタリング
    if (q) {
      processedNeeds = processedNeeds.filter(need => 
        need.title.toLowerCase().includes(q.toLowerCase())
      );
    }
    if (region) {
      processedNeeds = processedNeeds.filter(need => 
        need.region.includes(region)
      );
    }
    if (category) {
      processedNeeds = processedNeeds.filter(need => 
        need.category.includes(category)
      );
    }
    if (scope !== "all") {
      processedNeeds = processedNeeds.filter(need => need.status === scope);
    }
    
    // ソート
    processedNeeds.sort((a, b) => {
      if (sort === "popular") return b.proposals - a.proposals;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    
    // ページング
    const total = processedNeeds.length;
    const start = (page - 1) * pageSize;
    const items = processedNeeds.slice(start, start + pageSize);
    const hasMore = start + items.length < total;
    
    return { items, total, page, pageSize, hasMore };
    
  } catch (error) {
    console.error('Error fetching needs:', error);
    // エラー時はダミーデータを返す
    const fallbackData: NeedRow[] = [
      {
        id: "np-101",
        title: "自宅サウナを設置したい",
        category: "リフォーム",
        region: "港区",
        updatedAt: new Date().toISOString(),
        proposals: 4,
        status: "active",
        maskedPII: "個人情報は提案後に表示",
      }
    ];
    
    const start = (page - 1) * pageSize;
    const items = fallbackData.slice(start, start + pageSize);
    return { 
      items, 
      total: fallbackData.length, 
      page, 
      pageSize, 
      hasMore: start + items.length < fallbackData.length 
    };
  }
}

/** ===== SVG Icons ===== */
const IconUp = ({ className = "w-3.5 h-3.5" }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path d="M12 4l7 7-1.4 1.4L13 9.8V20h-2V9.8L6.4 12.4 5 11z" fill="currentColor" />
  </svg>
);
const IconWave = ({ className = "w-3.5 h-3.5" }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path
      d="M2 12c3 0 3-2 6-2s3 2 6 2 3-2 6-2v4c-3 0-3 2-6 2s-3-2-6-2-3 2-6 2v-4z"
      fill="currentColor"
    />
  </svg>
);
const IconCheck = ({ className = "w-3.5 h-3.5" }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5z" fill="currentColor" />
  </svg>
);

/** ===== Badge (emoji→SVG) ===== */
function Badge({ status }: { status: NeedRow["status"] }) {
  const map: Record<
    NeedRow["status"],
    { label?: string; cls?: string; icon?: JSX.Element }
  > = {
    active: { label: undefined, cls: undefined, icon: undefined },
    surfaced: {
      label: "浮上中",
      cls: "bg-amber-100 text-amber-800",
      icon: <IconUp />,
    },
    archived: {
      label: "海中",
      cls: "bg-sky-100 text-sky-700",
      icon: <IconWave />,
    },
    completed: {
      label: "成約",
      cls: "bg-emerald-100 text-emerald-700",
      icon: <IconCheck />,
    },
  };
  const b = map[status];
  if (!b.label) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded ${b.cls}`}
      aria-label={b.label}
    >
      <span className="inline-flex">{b.icon}</span>
      {b.label}
    </span>
  );
}

function Pagination({
  page,
  pageSize,
  total,
  baseQuery,
}: {
  page: number;
  pageSize: number;
  total: number;
  baseQuery: URLSearchParams;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const mk = (p: number) => {
    const q = new URLSearchParams(baseQuery);
    q.set("page", String(p));
    return `?${q.toString()}`;
  };
  if (pages <= 1) return null;
  const windowed = Array.from({ length: pages }, (_, i) => i + 1).slice(
    Math.max(0, page - 3),
    Math.min(pages, page + 2)
  );
  return (
    <nav className="flex items-center justify-end gap-1 text-sm" aria-label="pagination">
      <Link aria-label="前のページ" href={mk(Math.max(1, page - 1))} className="px-2 py-1 rounded border hover:bg-slate-50">
        前へ
      </Link>
      {windowed.map((p) => (
        <Link
          key={p}
          href={mk(p)}
          aria-current={p === page ? "page" : undefined}
          className={`px-2 py-1 rounded border ${p === page ? "bg-slate-900 text-white" : "hover:bg-slate-50"}`}
        >
          {p}
        </Link>
      ))}
      <Link aria-label="次のページ" href={mk(Math.min(pages, page + 1))} className="px-2 py-1 rounded border hover:bg-slate-50">
        次へ
      </Link>
    </nav>
  );
}

function NeedCard({ n }: { n: NeedRow }) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-blue-50/50 hover:shadow-lg hover:border-blue-100/60 transition-all duration-300 space-y-4">
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <Link href={`/needs/${n.id}`} className="text-lg font-semibold text-slate-800 hover:text-blue-600/80 transition-colors line-clamp-2 leading-snug flex-1">
            {n.title}
          </Link>
          <Badge status={n.status} />
        </div>
        
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {n.region}
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {n.category}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>更新: {new Date(n.updatedAt).toLocaleDateString()}</span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {n.proposals}件の提案
          </span>
        </div>
        
        {n.maskedPII && (
          <div className="text-xs text-slate-500 italic bg-slate-50/50 rounded-lg px-3 py-2">
            {n.maskedPII}
          </div>
        )}
      </div>
      
      <div className="space-y-3 pt-2 border-t border-blue-50/50">
        {/* Engagement Buttons */}
        <EngagementButtons needId={n.id} />
        
        {/* Detail Link */}
        <Link 
          className="block w-full text-center text-sm px-4 py-2 rounded-full border border-blue-100/60 text-blue-600/80 hover:bg-blue-50/50 transition-all duration-300" 
          href={`/needs/${n.id}`}
        >
          詳細を見る
        </Link>
      </div>
    </div>
  );
}

// ---- Page（Server Component）----
export default async function NeedsIndex({
  searchParams,
}: {
  searchParams: { [k: string]: string | string[] | undefined };
}) {
  const q = (searchParams.q as string) || "";
  const region = (searchParams.region as string) || "";
  const category = (searchParams.category as string) || "";
  const price = (searchParams.price as string) || "";
  const sort = (searchParams.sort as string) || "new";
  const scope = (searchParams.scope as string) || "all";
  const page = Number(searchParams.page ?? 1) || 1;
  const pageSize = 12;

  const data = await fetchNeedsSSR({
    q,
    region,
    category,
    price,
    sort: (["new", "popular", "due"] as const).includes(sort as any) ? (sort as any) : "new",
    scope: (["all", "active", "archived"] as const).includes(scope as any) ? (scope as any) : "all",
    page,
    pageSize,
  });

  // ベースクエリ（ページングリンク用）
  const baseQuery = new URLSearchParams();
  if (q) baseQuery.set("q", q);
  if (region) baseQuery.set("region", region);
  if (category) baseQuery.set("category", category);
  if (price) baseQuery.set("price", price);
  if (sort) baseQuery.set("sort", sort);
  if (scope) baseQuery.set("scope", scope);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/20 via-slate-50 to-blue-50/30">
      <div className="mx-auto max-w-7xl p-6 space-y-8">
        {/* ヘッダー - 素敵な世界観 */}
        <header className="text-center space-y-4 py-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100/60 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-800">みんなのニーズ</h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            地域に埋もれた小さな声を大切に。<br />
            あなたの「困った」が、誰かの「できる」と出会う場所です。
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 rounded-full border border-blue-100/50">
              <div className="w-2 h-2 bg-blue-400/70 rounded-full animate-pulse"></div>
              <span className="text-slate-700">{data.total}件のニーズ</span>
            </div>
          </div>
        </header>
        {/* フィルタータブ */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Link
            href={{ pathname: "/needs", query: { ...Object.fromEntries(baseQuery), scope: "all" } }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              scope === "all" 
                ? "bg-blue-500/90 text-white shadow-sm" 
                : "bg-white/70 text-slate-700 border border-blue-100/50 hover:bg-blue-50/50"
            }`}
          >
            すべて
          </Link>
          <Link
            href={{ pathname: "/needs", query: { ...Object.fromEntries(baseQuery), scope: "active" } }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              scope === "active" 
                ? "bg-blue-500/90 text-white shadow-sm" 
                : "bg-white/70 text-slate-700 border border-blue-100/50 hover:bg-blue-50/50"
            }`}
          >
            通常
          </Link>
          <Link
            href={{ pathname: "/needs", query: { ...Object.fromEntries(baseQuery), scope: "archived" } }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              scope === "archived" 
                ? "bg-blue-500/90 text-white shadow-sm" 
                : "bg-white/70 text-slate-700 border border-blue-100/50 hover:bg-blue-50/50"
            }`}
          >
            海中
          </Link>
        </div>

        {/* 検索・フィルター */}
        <section className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-blue-600/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="font-semibold text-slate-800">検索・絞り込み</h2>
          </div>
          <form className="grid gap-4 md:grid-cols-5">
            <input
              name="q"
              defaultValue={q}
              placeholder="キーワードを入力"
              className="md:col-span-2 border border-blue-100/60 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300/60 transition-all"
            />
            <input
              name="region"
              defaultValue={region}
              placeholder="地域（例: 港区）"
              className="border border-blue-100/60 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300/60 transition-all"
            />
            <input
              name="category"
              defaultValue={category}
              placeholder="カテゴリ（例: リフォーム）"
              className="border border-blue-100/60 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300/60 transition-all"
            />
            <select name="sort" defaultValue={sort} className="border border-blue-100/60 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300/60 transition-all">
              <option value="new">新着順</option>
              <option value="popular">人気順</option>
              <option value="due">期限順</option>
            </select>
            <div className="flex gap-3 md:col-span-5 pt-2">
              <button className="px-6 py-3 rounded-full bg-blue-500/90 text-white text-sm font-medium hover:bg-blue-600/90 transition-all duration-300 shadow-sm">
                この条件で検索
              </button>
              <Link href="/needs" className="px-6 py-3 rounded-full border border-blue-100/60 text-slate-700 text-sm font-medium hover:bg-blue-50/50 transition-all duration-300">
                リセット
              </Link>
            </div>
          </form>
        </section>

        {/* カード表示 */}
        <section className="space-y-6">
          {data.items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto bg-blue-100/60 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">該当するニーズが見つかりませんでした</h3>
              <p className="text-slate-600 mb-6">検索条件を変更して再度お試しください</p>
              <Link href="/needs" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500/90 text-white rounded-full hover:bg-blue-600/90 transition-all duration-300">
                すべてのニーズを見る
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((n) => (
                <NeedCard key={n.id} n={n} />
              ))}
            </div>
          )}
        </section>

        {/* ページング */}
        <section className="flex items-center justify-between py-8">
          <div className="text-sm text-slate-600">全 {data.total} 件のニーズ</div>
          <Pagination page={data.page} pageSize={data.pageSize} total={data.total} baseQuery={baseQuery} />
        </section>

        {/* コール・トゥ・アクション */}
        <section className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-blue-100/50">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800">あなたのニーズも投稿しませんか？</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              小さな困りごとから大きな夢まで。<br />
              地域の事業者があなたをサポートします。
            </p>
            <Link 
              href="/needs/new" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500/90 text-white font-semibold rounded-full hover:bg-blue-600/90 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              ニーズを投稿する
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}