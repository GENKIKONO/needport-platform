"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import Card from "../../../_parts/Card";
import Badge from "../../../_parts/Badge";
import Skeleton from "../../../_parts/Skeleton";
import { fetcher } from "../../../_parts/useSWRFetcher";

type VendorDetail = {
  user_id: string;
  name: string;
  avatar_url?: string;
  public_areas?: string;
  website?: string;
  industries?: string[];
  license_no?: string;
};

export default function VendorPublicProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { data, error, isLoading } = useSWR<{ rows: VendorDetail[] }>(
    id ? `/api/vendors?userId=${encodeURIComponent(id)}` : null,
    fetcher,
    { refreshInterval: 60000 }
  );

  if (isLoading) return (
    <div className="max-w-3xl mx-auto p-4"><Skeleton.Card /></div>
  );
  if (error || !data?.rows?.length) return (
    <div className="max-w-3xl mx-auto p-4">事業者が見つかりませんでした。</div>
  );

  const v = data.rows[0];

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <Card>
        <Card.Header>
          <div className="flex items-center gap-3">
            {v.avatar_url && <img src={v.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />}
            <div className="font-semibold text-xl">{v.name}</div>
          </div>
          <div className="flex flex-wrap gap-1">
            {(v.industries || []).map((n, idx) => <Badge key={idx} color="slate">{n}</Badge>)}
          </div>
        </Card.Header>
        <Card.Body>
          <div className="space-y-1 text-sm">
            <div><span className="text-slate-500">対応エリア：</span>{v.public_areas || "未設定"}</div>
            {v.license_no && <div><span className="text-slate-500">許可/免許：</span>{v.license_no}</div>}
            {v.website && (
              <div><a href={v.website} target="_blank" className="text-sky-700 underline">Webサイトを開く</a></div>
            )}
          </div>
        </Card.Body>
        <Card.Footer>
          <a href="/v2/needs" className="px-3 py-2 rounded border">ニーズを探す</a>
        </Card.Footer>
      </Card>
    </div>
  );
}
