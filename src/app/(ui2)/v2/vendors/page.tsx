"use client";

import useSWR from "swr";
import { useSearchParams, useRouter } from "next/navigation";
import { fetcher } from "../../_parts/useSWRFetcher";
import Card from "../../_parts/Card";
import Badge from "../../_parts/Badge";
import Skeleton from "../../_parts/Skeleton";
import ErrorBox from "../../_parts/ErrorBox";
import { useToast } from "../../_parts/ToastProvider";

type Industry = { id: string; slug: string; name: string; fee_applicable: boolean };
type Vendor = {
  user_id: string;
  name: string;
  public_areas?: string;
  avatar_url?: string;
  website?: string;
  industries?: string[];
  any_fee_blocked?: boolean;
};

export default function VendorsV2Page() {
  const sp = useSearchParams();
  const slug = sp.get("slug") || "";
  const router = useRouter();

  const { data: inds, isLoading: indLoading } = useSWR<{ rows: Industry[] }>(
    "/api/industries",
    fetcher,
    { refreshInterval: 120000 }
  );
  const listUrl = slug ? `/api/vendors?slug=${encodeURIComponent(slug)}` : "/api/vendors";
  const { data, error, isLoading } = useSWR<{ rows: Vendor[] }>(listUrl, fetcher, { refreshInterval: 10000 });
  const { push } = useToast();
  if (error) { push({ kind:"error", message:"事業者リストの読み込みに失敗しました" }); }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">事業者リスト</h1>

      {/* タブ */}
      <div className="flex flex-wrap gap-2">
        <button
          className={`px-3 py-1.5 rounded border ${!slug ? 'bg-slate-900 text-white' : ''}`}
          onClick={() => router.push("/v2/vendors")}
        >すべて</button>
        {indLoading ? (
          <Skeleton.Pill />
        ) : (
          inds?.rows?.map((i) => (
            <button
              key={i.id}
              className={`px-3 py-1.5 rounded border ${slug === i.slug ? 'bg-slate-900 text-white' : ''}`}
              onClick={() => router.push(`/v2/vendors?slug=${i.slug}`)}
              title={i.fee_applicable ? "成果報酬 対象" : "成果報酬 対象外"}
            >
              {i.name}{i.fee_applicable ? "" : "（対象外）"}
            </button>
          ))
        )}
      </div>

      {/* 一覧 */}
      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton.Card key={i} />)}
        </div>
      )}
      {error && <div className="mt-3"><ErrorBox /></div>}
      {!isLoading && !error && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data?.rows?.map((v) => (
            <Card key={v.user_id}>
              <Card.Header>
                <div className="font-medium">{v.name}</div>
                <div className="flex flex-wrap gap-1">
                  {(v.industries || []).map((n, idx) => (
                    <Badge key={idx} color="slate">{n}</Badge>
                  ))}
                </div>
              </Card.Header>
              <Card.Body>
                <div className="text-sm text-slate-700">{v.public_areas || "対応エリア未設定"}</div>
                {v.website && (
                  <a href={v.website} target="_blank" className="text-sky-700 text-sm underline">Webサイト</a>
                )}
                {v.any_fee_blocked && (
                  <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                    成果報酬対象外のカテゴリを含みます
                  </div>
                )}
              </Card.Body>
              <Card.Footer>
                <a className="px-3 py-2 rounded border" href={`/v2/vendors/${v.user_id}`}>プロフィール</a>
              </Card.Footer>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
