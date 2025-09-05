// src/app/needs/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

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

// ---- ダミーSSR（本番でも表示確認ができる最低限の土台） ----
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
  // 実データ接続は後で Supabase/既存API に差し替え。ここはUI検証用に安定したダミーを返す。
  const base: NeedRow[] = [
    {
      id: "np-101",
      title: "自宅サウナを設置したい",
      category: "リフォーム",
      region: "港区",
      updatedAt: new Date().toISOString(),
      proposals: 4,
      status: "active",
      maskedPII: "氏名・住所は閲覧解放後に表示",
    },
    {
      id: "np-102",
      title: "結婚式で車いす家族の送迎",
      category: "移動支援",
      region: "新宿区",
      updatedAt: new Date().toISOString(),
      proposals: 2,
      status: "surfaced",
      maskedPII: "電話番号は解放後に表示",
    },
    {
      id: "np-103",
      title: "週3回の夕食作り置き",
      category: "家事支援",
      region: "世田谷区",
      updatedAt: new Date().toISOString(),
      proposals: 1,
      status: "archived",
      maskedPII: "氏名は解放後に表示",
    },
    {
      id: "np-104",
      title: "地下室の防音改修",
      category: "リフォーム",
      region: "大田区",
      updatedAt: new Date().toISOString(),
      proposals: 7,
      status: "active",
      maskedPII: "住所は解放後に表示",
    },
    {
      id: "np-105",
      title: "学童の送迎シェア",
      category: "送迎",
      region: "杉並区",
      updatedAt: new Date().toISOString(),
      proposals: 0,
      status: "active",
      maskedPII: "氏名は解放後に表示",
    },
    {
      id: "np-106",
      title: "空き家の片付け・買取相談",
      category: "不動産",
      region: "足立区",
      updatedAt: new Date().toISOString(),
      proposals: 3,
      status: "completed",
      maskedPII: "-",
    },
  ];
  // scope
  const scoped = base.filter((b) => (scope === "all" ? true : b.status === scope));
  // q, region, category は簡易フィルタ
  const filtered = scoped.filter(
    (b) =>
      (!q || b.title.includes(q)) &&
      (!region || b.region.includes(region)) &&
      (!category || b.category.includes(category))
  );
  // sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "popular") return b.proposals - a.proposals;
    // "due" はダミーでは new と同じ扱い
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
  // paging
  const start = (page - 1) * pageSize;
  const items = sorted.slice(start, start + pageSize);
  const total = sorted.length;
  const hasMore = start + items.length < total;
  return { items, total, page, pageSize, hasMore };
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
    <div className="border rounded p-4 space-y-2 bg-white">
      <div className="flex items-center gap-2">
        <Link href={`/needs/${n.id}`} className="font-semibold hover:underline">
          {n.title}
        </Link>
        <Badge status={n.status} />
      </div>
      <div className="text-xs text-slate-600">カテゴリ：{n.category}・地域：{n.region}</div>
      <div className="text-xs text-slate-600">
        更新：{new Date(n.updatedAt).toLocaleDateString()}・提案：{n.proposals}
      </div>
      <div className="text-xs text-slate-500">{n.maskedPII ?? ""}</div>
      <div className="pt-2 flex gap-2">
        <Link className="text-sm px-2 py-1 rounded border" href={`/needs/${n.id}`}>
          詳細
        </Link>
        <Link className="text-sm px-2 py-1 rounded border" href={`/needs/${n.id}#cta`}>
          提案する
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
    <div className="mx-auto max-w-7xl p-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">ニーズ一覧</h1>
          <p className="text-slate-600 text-sm">
            検索・絞り込みが可能。未成約が続くニーズは{" "}
            <Link className="text-sky-700 underline" href={IDENTITY.SEA_PATH}>
              「海中」
            </Link>{" "}
            に移動します。
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Link
            href={{ pathname: "/needs", query: { ...Object.fromEntries(baseQuery), scope: "all" } }}
            className={`px-2 py-1 rounded border ${scope === "all" ? "bg-slate-900 text-white" : ""}`}
          >
            すべて
          </Link>
          <Link
            href={{ pathname: "/needs", query: { ...Object.fromEntries(baseQuery), scope: "active" } }}
            className={`px-2 py-1 rounded border ${scope === "active" ? "bg-slate-900 text-white" : ""}`}
          >
            通常
          </Link>
          <Link
            href={{ pathname: "/needs", query: { ...Object.fromEntries(baseQuery), scope: "archived" } }}
            className={`px-2 py-1 rounded border ${scope === "archived" ? "bg-slate-900 text-white" : ""}`}
          >
            海中
          </Link>
          <Link href={IDENTITY.SEA_PATH} className="px-2 py-1 rounded border hover:bg-slate-50">
            → 海中ページへ
          </Link>
        </div>
      </header>

      {/* フィルタ&検索 */}
      <section className="border rounded p-4 bg-white">
        <form className="grid gap-3 md:grid-cols-5">
          <input
            name="q"
            defaultValue={q}
            placeholder="キーワード"
            className="md:col-span-2 border rounded px-3 py-2 text-sm"
          />
          <input
            name="region"
            defaultValue={region}
            placeholder="地域（例: 港区）"
            className="border rounded px-3 py-2 text-sm"
          />
          <input
            name="category"
            defaultValue={category}
            placeholder="カテゴリ（例: リフォーム）"
            className="border rounded px-3 py-2 text-sm"
          />
          <select name="sort" defaultValue={sort} className="border rounded px-2 py-2 text-sm">
            <option value="new">新着</option>
            <option value="popular">人気</option>
            <option value="due">期限</option>
          </select>
          <div className="flex gap-2 md:col-span-5">
            <button className="px-3 py-2 rounded bg-sky-600 text-white text-sm">この条件で検索</button>
            <Link href="/needs" className="px-3 py-2 rounded border text-sm">
              リセット
            </Link>
          </div>
        </form>
      </section>

      {/* SP: カード / PC: テーブル（md以上でテーブル表示） */}
      <section className="space-y-3">
        {/* カード表示（md未満） */}
        <div className="grid gap-4 sm:grid-cols-2 md:hidden">
          {data.items.map((n) => (
            <NeedCard key={n.id} n={n} />
          ))}
        </div>

        {/* テーブル表示（md以上） */}
        <div className="hidden md:block overflow-x-auto bg-white border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left p-3 w-[40%]">タイトル</th>
                <th className="text-left p-3">カテゴリ</th>
                <th className="text-left p-3">地域</th>
                <th className="text-right p-3">提案</th>
                <th className="text-left p-3">更新日</th>
                <th className="text-right p-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((n) => (
                <tr key={n.id} className="border-t">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/needs/${n.id}`} className="font-medium hover:underline">
                        {n.title}
                      </Link>
                      <Badge status={n.status} />
                    </div>
                    <div className="text-[11px] text-slate-500">{n.maskedPII ?? ""}</div>
                  </td>
                  <td className="p-3">{n.category}</td>
                  <td className="p-3">{n.region}</td>
                  <td className="p-3 text-right">{n.proposals}</td>
                  <td className="p-3">{new Date(n.updatedAt).toLocaleDateString()}</td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-2">
                      <Link className="px-2 py-1 rounded border" href={`/needs/${n.id}`}>
                        詳細
                      </Link>
                      <Link className="px-2 py-1 rounded border" href={`/needs/${n.id}#cta`}>
                        提案
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {data.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    条件に合うニーズが見つかりません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* フッター（ページング＋海中導線） */}
      <section className="flex items-center justify-between">
        <div className="text-sm text-slate-600">全 {data.total} 件</div>
        <Pagination page={data.page} pageSize={data.pageSize} total={data.total} baseQuery={baseQuery} />
      </section>

      <div className="mt-3 text-right">
        <a className="text-sky-600 hover:underline" href="/sea">
          海中（ニーズ保管庫）を見る
        </a>
        <span className="ml-2 text-xs text-slate-500">(検索・絞り込み対象に含む／成約で浮上)</span>
      </div>
    </div>
  );
}
