// src/app/needs/[id]/page.tsx
import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";

// identity（存在すれば使う）
let IDENTITY: { SEA_PATH: string };
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  IDENTITY = require("@/config/identity").IDENTITY;
} catch {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  IDENTITY = require("@/config/identity.fallback").IDENTITY;
}

export const dynamic = "force-dynamic";

/* ========= types ========= */
type NeedDetail = {
  id: string;
  title: string;
  category: string;
  region: string;
  description: string;
  budgetHint?: string;
  updatedAt: string; // ISO
  status: "active" | "archived" | "completed" | "surfaced";
  masked: { name?: string; phone?: string; address?: string };
  unlocked?: boolean; // 閲覧解放済みか（ダミー）
  proposals: number;
  related: Array<{ id: string; title: string }>;
};

/* ========= ダミーデータ（本番でも表示できる土台） ========= */
async function fetchNeedSSR(id: string): Promise<NeedDetail | null> {
  const now = new Date().toISOString();
  const rows: NeedDetail[] = [
    {
      id: "np-101",
      title: "自宅サウナを設置したい",
      category: "リフォーム",
      region: "港区",
      description:
        "マンション内のユニットバスを改修し、1人用サウナの導入を検討。防水・電源容量・管理規約面を含めた提案が欲しい。",
      budgetHint: "〜150万円目安",
      updatedAt: now,
      status: "active",
      masked: { name: "氏名は解放後に表示", phone: "電話は解放後に表示", address: "住所は解放後に表示" },
      unlocked: false,
      proposals: 4,
      related: [
        { id: "np-104", title: "地下室の防音改修" },
        { id: "np-105", title: "学童の送迎シェア" },
        { id: "np-106", title: "空き家の片付け・買取相談" },
      ],
    },
    {
      id: "np-103",
      title: "週3回の夕食作り置き",
      category: "家事支援",
      region: "世田谷区",
      description: "アレルギー配慮あり。買い出し含む。週3回・2時間程度での定期依頼を想定。",
      budgetHint: "1回5,000〜8,000円＋食材",
      updatedAt: now,
      status: "archived",
      masked: { name: "氏名は解放後に表示", phone: "電話は解放後に表示", address: "住所は解放後に表示" },
      unlocked: false,
      proposals: 1,
      related: [
        { id: "np-101", title: "自宅サウナを設置したい" },
        { id: "np-102", title: "結婚式で車いす家族の送迎" },
        { id: "np-104", title: "地下室の防音改修" },
      ],
    },
  ];
  return rows.find((r) => r.id === id) ?? rows[0] ?? null;
}

/* ========= 動的メタ ========= */
export async function generateMetadata(
  { params }: { params: { id: string } },
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const d = await fetchNeedSSR(params.id);
  const title = d ? `${d.title} | NeedPort` : "ニーズ詳細 | NeedPort";
  const description =
    d?.description?.slice(0, 80) ??
    "匿名での条件すり合わせ→成約までの流れを安全に。閲覧解放・提案・シェアに対応。";
  const url = `https://needport.jp/needs/${params.id}`;
  return {
    title,
    description,
    openGraph: { title, description, url, siteName: "NeedPort" },
    alternates: { canonical: url },
  };
}

/* ========= SVG icons（絵文字禁止方針） ========= */
const IconUp = ({ className = "w-3.5 h-3.5" }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden><path d="M12 4l7 7-1.4 1.4L13 9.8V20h-2V9.8L6.4 12.4 5 11z" fill="currentColor"/></svg>
);
const IconWave = ({ className = "w-3.5 h-3.5" }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden><path d="M2 12c3 0 3-2 6-2s3 2 6 2 3-2 6-2v4c-3 0-3 2-6 2s-3-2-6-2-3 2-6 2v-4z" fill="currentColor"/></svg>
);
const IconCheck = ({ className = "w-3.5 h-3.5" }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden><path d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5z" fill="currentColor"/></svg>
);

/* ========= Badge ========= */
function StatusBadge({ status }: { status: NeedDetail["status"] }) {
  const m: Record<NeedDetail["status"], { label?: string; cls?: string; icon?: JSX.Element }> = {
    active: { },
    surfaced: { label: "浮上中", cls: "bg-amber-100 text-amber-800", icon: <IconUp/> },
    archived: { label: "海中", cls: "bg-sky-100 text-sky-700", icon: <IconWave/> },
    completed: { label: "成約", cls: "bg-emerald-100 text-emerald-700", icon: <IconCheck/> },
  };
  const b = m[status];
  if (!b.label) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] ${b.cls}`} aria-label={b.label}>
      <span className="inline-flex">{b.icon}</span>{b.label}
    </span>
  );
}

/* ========= Page ========= */
export default async function NeedDetailPage({ params }: { params: { id: string } }) {
  const detail = await fetchNeedSSR(params.id);
  if (!detail) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="text-xl font-bold">ニーズが見つかりませんでした</h1>
        <p className="text-slate-600 mt-2"><Link href="/needs" className="text-sky-700 underline">一覧に戻る</Link></p>
      </div>
    );
  }

  const masked = detail.unlocked
    ? { name: "山田 太郎", phone: "090-XXXX-XXXX", address: "東京都港区..." } // ダミー表示
    : detail.masked;

  const url = `https://needport.jp/needs/${detail.id}`;

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      {/* ヘッダー */}
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/needs" className="text-sky-700 hover:underline">← 一覧へ</Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-600">{detail.category}</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-600">{detail.region}</span>
          <StatusBadge status={detail.status}/>
        </div>
        <h1 className="text-2xl font-bold">{detail.title}</h1>
        <div className="text-xs text-slate-600">更新：{new Date(detail.updatedAt).toLocaleString()}</div>
      </header>

      {/* 本文 */}
      <section className="grid gap-6 md:grid-cols-[1fr_320px]">
        {/* 左カラム：本文 */}
        <article className="space-y-4">
          <div className="rounded border bg-white p-4">
            <h2 className="font-semibold mb-2">概要</h2>
            <p className="text-slate-700 whitespace-pre-line">{detail.description}</p>
            {detail.budgetHint && (
              <p className="mt-3 text-sm text-slate-600">目安：{detail.budgetHint}</p>
            )}
          </div>

          {/* 連絡先パネル（クリック展開の枠。unlocked=false なら伏字） */}
          <details className="rounded border bg-white p-4">
            <summary className="cursor-pointer font-semibold">連絡先（成約時のみ最小限開示）</summary>
            <div className="mt-3 space-y-1 text-sm text-slate-700">
              <div>氏名：{masked.name ?? "-"}</div>
              <div>電話：{masked.phone ?? "-"}</div>
              <div>住所：{masked.address ?? "-"}</div>
              {!detail.unlocked && (
                <p className="text-xs text-slate-500 mt-2">※ 閲覧解放後に表示されます</p>
              )}
            </div>
          </details>

          {/* 関連ニーズ */}
          {detail.related?.length ? (
            <div className="rounded border bg-white p-4">
              <h3 className="font-semibold mb-2">関連ニーズ</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {detail.related.map(r => (
                  <li key={r.id}>
                    <Link className="text-sky-700 hover:underline" href={`/needs/${r.id}`}>{r.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>

        {/* 右カラム：CTA */}
        <aside id="cta" className="space-y-3">
          {/* 提案ボタン（事業者） */}
          <Link
            href={`/needs/${detail.id}/propose`}
            className="block w-full text-center px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700"
          >
            提案する
          </Link>

          {/* 閲覧解放（事業者有料・将来Stripe連携） */}
          <Link
            href={`/needs/${detail.id}/unlock`}
            className="block w-full text-center px-4 py-2 rounded border hover:bg-slate-50"
          >
            閲覧解放（詳細を表示）
          </Link>

          {/* チャット機能（Lv1: 依頼者↔事業者） */}
          <Link
            href={`/chat/${detail.id}`}
            className="block w-full text-center px-4 py-2 rounded border border-green-300 bg-green-50 text-green-800 hover:bg-green-100"
          >
            💬 チャットを開く (Lv1)
          </Link>

          {/* シェア（サーバーコンポーネント対応） */}
          <div className="rounded border bg-white p-4 space-y-2">
            <div className="font-semibold">シェア</div>
            <div className="text-sm text-slate-600">このニーズを紹介して賛同を集めましょう。</div>
            <div className="flex flex-wrap gap-2 items-center">
              <a
                className="px-2 py-1 text-sm rounded border hover:bg-slate-50"
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(detail.title)}&url=${encodeURIComponent(url)}`}
                target="_blank" rel="noopener noreferrer"
              >
                X で共有
              </a>
              <label className="text-xs text-slate-500">URL:</label>
              <input
                readOnly
                value={url}
                className="min-w-[220px] grow px-2 py-1 text-xs border rounded bg-slate-50"
                aria-label="このページのURL"
              />
            </div>
          </div>

          {/* 海中導線 */}
          <div className="rounded border bg-white p-3 text-xs text-slate-600">
            未成約が続くニーズは <Link className="text-sky-700 underline" href={IDENTITY.SEA_PATH}>「海中」</Link> に移ります。
            海中でも検索・提案・成約が可能で、成約・浮上時は通常一覧の上部に表示されます。
          </div>
        </aside>
      </section>
    </div>
  );
}

