"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { BlockCard, InfoRow } from "@/app/(ui2)/_parts/InfoItem";
import FlowSteps from "@/app/(ui2)/_parts/FlowSteps";
import fetcher from "@/app/(ui2)/_parts/useSWRFetcher";
import RelatedNeeds from "./RelatedNeeds";

export default function NeedDetailV2Page() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  // 既存の list API を単品取得に利用（id フィルタ対応想定。無い場合はバックエンド側で id 対応済）
  const { data, error, isLoading } = useSWR<{ rows: any[] }>(
    `/api/needs/list?id=${encodeURIComponent(id)}&per=1`,
    fetcher,
    { refreshInterval: 8000, revalidateOnFocus: false }
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-8 w-2/3 rounded bg-slate-100 animate-pulse" />
        <div className="h-6 w-1/2 rounded bg-slate-100 animate-pulse" />
        <div className="h-32 rounded bg-slate-100 animate-pulse" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="rounded border border-red-200 bg-red-50 p-3 text-red-700">
          詳細の読み込みに失敗しました。時間をおいて再度お試しください。
        </div>
        <div className="mt-3">
          <Link href="/v2/needs" className="text-sky-700 underline">一覧に戻る</Link>
        </div>
      </div>
    );
  }

  const need = data?.rows?.[0];
  if (!need) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="rounded border bg-white p-3">このニーズは見つかりませんでした。</div>
        <div className="mt-3">
          <Link href="/v2/needs" className="text-sky-700 underline">一覧に戻る</Link>
        </div>
      </div>
    );
  }

  const whenDate = need.when_date ? new Date(need.when_date).toLocaleDateString() : null;
  const whenTime = need.when_time ?? null;
  const whereFrom = need.where_from_masked ?? need.where_from ?? null;
  const whereTo = need.where_to_masked ?? need.where_to ?? null;
  const whoCount = need.who_count ?? null;
  const wheelchair = typeof need.wheelchair === "boolean" ? (need.wheelchair ? "あり" : "なし") : null;
  const helpers = Number.isFinite(need.helpers_needed) ? `${need.helpers_needed} 名` : null;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-5">
      {/* ヘッダー */}
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{need.title}</h1>
        <div className="mt-1 text-slate-600">{need.summary}</div>
        <div className="mt-2 text-xs text-slate-500">
          {need.region || "—"} / {need.category || "—"} / 期限 {need.deadline ? new Date(need.deadline).toLocaleDateString() : "—"}
        </div>
      </header>

      {/* 5W1H ブロック（care_taxi 等のときに特に効く） */}
      <BlockCard title="5W1H（条件の概要）">
        <InfoRow label="いつ（日時）" value={<span>{whenDate || "—"} {whenTime ? ` ${whenTime}` : ""}</span>} />
        <InfoRow label="どこから → どこへ" value={<span>{whereFrom || "—"} → {whereTo || "—"}</span>} />
        <InfoRow label="だれ（人数）" value={whoCount ? `${whoCount} 名` : "—"} />
        <InfoRow label="車椅子" value={wheelchair || "—"} />
        <InfoRow label="介助人数" value={helpers || "—"} />
        <InfoRow label="その他" value={need.kind ? `${need.kind}` : "—"} />
      </BlockCard>

      {/* 流れ案内（匿名→条件→成約で顔合わせ） */}
      <FlowSteps />

      {/* アクション */}
      <section className="rounded-lg border bg-white p-4">
        <div className="flex flex-wrap gap-3">
          <Link href={`/proposals/${need.id}/chat`} className="rounded-md bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800">
            条件をすり合わせる（チャット）
          </Link>
          <Link href="/v2/needs" className="rounded-md border px-4 py-2 text-sm hover:bg-slate-50">
            一覧に戻る
          </Link>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          ※ メッセージは <b>管理者承認後</b> に相手へ表示されます。個人情報やNGワードは自動チェックされます。
        </p>
      </section>

      {/* 関連ニーズ（同地域・同カテゴリの回遊） */}
      <RelatedNeeds region={need.region} category={need.category} excludeId={need.id} />
    </div>
  );
}
