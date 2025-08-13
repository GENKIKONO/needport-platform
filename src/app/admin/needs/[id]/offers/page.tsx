
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import OfferAddForm from "@/components/admin/OfferAddForm";
import OfferDeleteButton from "@/components/admin/OfferDeleteButton";
import OfferEditButton from "@/components/admin/OfferEditButton";
import OfferAdoptButton from "@/components/admin/OfferAdoptButton";
import OfferUnadoptButton from "@/components/admin/OfferUnadoptButton";
import AdoptionSettingsForm from "@/components/admin/AdoptionSettingsForm";
import RecruitmentToggle from "@/components/admin/RecruitmentToggle";
import StatusSelector from "@/components/admin/StatusSelector";
import VendorInviteForm from "@/components/admin/VendorInviteForm";
import AdminBar from "@/components/admin/AdminBar";
import EmptyState from "@/components/ui/EmptyState";
import { FF_PAGINATION } from "@/lib/flags";
import { createAdminClient } from "@/lib/supabase/admin";

type Offer = {
  id: string;
  need_id: string;
  vendor_name: string | null;
  amount: number | null;
  created_at: string;
};

const nf = new Intl.NumberFormat("ja-JP");

export default async function OffersPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  try {
    const { id } = await params;
    const sp = await searchParams;

    const sortKey = sp.sort === "date" ? "created_at" : "amount";
    const sortAsc = (sp.order ?? "asc") === "asc";
    const page = Math.max(1, Number(sp.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(sp.per) || 20));
    const offset = (page - 1) * pageSize;
    const vendor = sp.vendor as string | undefined;

    const supabase = createAdminClient();
    
    // Get need data to check adopted offer
    const { data: needRow } = await supabase
      .from("needs")
      .select("adopted_offer_id, min_people, deadline, recruitment_closed")
      .eq("id", id)
      .single();
    const adoptedId = needRow?.adopted_offer_id as string | null | undefined;

    // Build base query
    let baseQuery = supabase
      .from("offers")
      .select("id, need_id, vendor_name, amount, created_at")
      .eq("need_id", id);

    // Apply vendor filter if provided
    if (vendor?.trim()) {
      baseQuery = baseQuery.ilike("vendor_name", `%${vendor.trim()}%`);
    }

    // Get total count with same filters
    // @ts-expect-error - Supabase type issue, will be fixed when types are updated
    const { count } = await baseQuery.select("id", { count: "exact", head: true });

    // Get paginated data
    const { data, error } = await baseQuery
      .order(sortKey, { ascending: sortAsc, nullsFirst: false })
      .range(offset, offset + pageSize - 1);

    // Get adoption logs
    const { data: logsData } = await supabase
      .from("adoption_logs")
      .select(`
        id,
        action,
        created_at,
        offers!left(vendor_name)
      `)
      .eq("need_id", id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("[offers] supabase error", error);
      return (
        <div className="p-6 text-red-500">
          取得に失敗しました。<pre className="whitespace-pre-wrap text-xs mt-2">{error.message}</pre>
        </div>
      );
    }

    const offers: Offer[] = data ?? [];
    const adoptionLogs = logsData ?? [];
    const totalCount = count ?? 0;
    const amounts = offers.map(o => o.amount ?? 0);
    const cnt = offers.length;
    const min = amounts.length ? Math.min(...amounts) : 0;
    const max = amounts.length ? Math.max(...amounts) : 0;
    const avg = amounts.length ? Math.round(amounts.reduce((a,b)=>a+b,0) / amounts.length) : 0;
    const cheapestAmount = offers[0]?.amount ?? 0;

    const nextOrder = (key: "amount" | "created_at") => {
      const isCurrent = sortKey === key;
      const currentOrder = sortAsc ? "asc" : "desc";
      const next = isCurrent ? (sortAsc ? "desc" : "asc") : "asc";
      return `?sort=${key === "created_at" ? "date" : "amount"}&order=${next}&page=${page}&per=${pageSize}`;
    };

    const getPageUrl = (newPage: number) => {
      const params = new URLSearchParams();
      params.set("sort", sortKey === "created_at" ? "date" : "amount");
      params.set("order", sortAsc ? "asc" : "desc");
      params.set("page", String(newPage));
      params.set("per", String(pageSize));
      if (vendor) params.set("vendor", vendor);
      return `?${params.toString()}`;
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
      <div className="space-y-6">
        <AdminBar title="オファー比較" />
        <div className="p-6">
          <h1 className="text-xl font-semibold mb-6">オファー比較</h1>

        {/* 追加フォーム */}
        <div id="add-offer" className="rounded-lg border p-4">
          <h2 className="font-medium mb-2">オファーを追加</h2>
          <OfferAddForm needId={id} />
        </div>

        {/* 並び替え / CSV */}
        <div className="flex flex-wrap gap-3 items-center">
          <a className="underline" href={nextOrder("amount")}>
            金額で並び替え（{sortKey === "amount" ? (sortAsc ? "昇順→降順" : "降順→昇順") : "昇順"}）
          </a>
          <a className="underline" href={nextOrder("created_at")}>
            日時で並び替え（{sortKey === "created_at" ? (sortAsc ? "昇順→降順" : "降順→昇順") : "昇順"}）
          </a>
          <a className="underline" href={`./offers.csv?sort=${sortKey === "created_at" ? "date" : "amount"}&order=${sortAsc ? "asc" : "desc"}`}>
            CSVダウンロード
          </a>
          <span className="text-sm text-gray-400">
            {((page - 1) * pageSize + 1)}–{Math.min(page * pageSize, totalCount)} of {totalCount}
          </span>
        </div>

        {/* Vendor Search */}
        <div className="mb-4">
          <form method="GET" className="flex gap-2">
            <input
              type="text"
              name="vendor"
              defaultValue={vendor}
              placeholder="ベンダー名で検索..."
              className="flex-1 rounded-lg bg-zinc-800 px-3 py-2 outline-none ring-1 ring-white/10"
            />
            <button
              type="submit"
              className="rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-3 py-2 text-sm text-emerald-200 hover:bg-emerald-600/30"
            >
              検索
            </button>
            {vendor && (
              <a
                href="?"
                className="rounded-lg border border-gray-500/40 bg-gray-600/20 px-3 py-2 text-sm text-gray-200 hover:bg-gray-600/30"
              >
                クリア
              </a>
            )}
          </form>
        </div>
        </div>

        {/* サマリー */}
        <div className="sticky top-0 bg-background/80 backdrop-blur z-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-md bg-neutral-800 p-3">件数：{cnt}</div>
            <div className="rounded-md bg-emerald-900/30 text-emerald-400 p-3">最安：{nf.format(min)} 円</div>
            <div className="rounded-md bg-sky-900/30 text-sky-400 p-3">最高：{nf.format(max)} 円</div>
            <div className="rounded-md bg-amber-900/30 text-amber-400 p-3">平均：{nf.format(avg)} 円</div>
          </div>
        </div>

        {/* 採用設定表示 */}
        {adoptedId && (
          <div className="mb-4 space-y-4">
            <div className="text-xs opacity-80">
              採用設定: 最低人数 {needRow?.min_people ?? "-"} / 締切 {needRow?.deadline ?? "-"}
            </div>
            <AdoptionSettingsForm 
              needId={id} 
              currentMinPeople={needRow?.min_people} 
              currentDeadline={needRow?.deadline} 
            />
            <RecruitmentToggle 
              needId={id} 
              initialClosed={needRow?.recruitment_closed ?? false} 
            />
          </div>
        )}

        {/* 事業者に声かけ */}
        <div className="mb-6 rounded-lg border p-4">
          <h3 className="font-medium mb-3">事業者に声かけ</h3>
          <VendorInviteForm needId={id} />
        </div>

        {/* 一覧 */}
        {offers.length === 0 ? (
          <EmptyState
            title="オファーがありません"
            description="このニーズにはまだオファーが投稿されていません。上記のフォームからオファーを追加してください。"
            action={{
              label: "オファーを追加",
              href: "#add-offer"
            }}
          />
        ) : (
          <div className="space-y-3">
            {offers.map((o, i) => {
              const diff = (o.amount ?? 0) - cheapestAmount;
              const diffLabel =
                diff === 0 ? "±0 円" :
                diff > 0 ? `+${nf.format(diff)} 円` : `-${nf.format(Math.abs(diff))} 円`;
              const diffClass =
                diff === 0 ? "text-neutral-400" :
                diff > 0 ? "text-red-400" : "text-emerald-400";

              return (
                <div key={o.id} className="rounded border p-3 hover:bg-white/5 supports-[color-scheme:light]:hover:bg-black/5" data-testid="offer-row">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{o.vendor_name || "提供者未設定"}</div>
                    {i === 0 && <span className="text-emerald-500 bg-emerald-600/15 text-xs px-2 py-0.5 rounded-full">最安</span>}
                    {o.id === adoptedId && (
                      <span className="rounded-md bg-emerald-600/20 px-2 py-0.5 text-[11px] text-emerald-300">
                        採用済み
                      </span>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                      <div>{nf.format(o.amount ?? 0)} 円</div>
                      {o.id === adoptedId ? (
                        <OfferUnadoptButton needId={id} />
                      ) : (
                        <OfferAdoptButton needId={id} offerId={o.id} />
                      )}
                      <OfferEditButton offerId={o.id} currentVendor={o.vendor_name} currentAmount={o.amount} />
                      <OfferDeleteButton offerId={o.id} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs opacity-70 mt-1">
                    <div>{new Date(o.created_at).toLocaleString("ja-JP")}</div>
                    <div className={diffClass}>（最安との差：{diffLabel}）</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 採用履歴 */}
        <div className="mt-8">
          <h3 className="text-sm font-medium mb-3">採用履歴（最新10件）</h3>
          <div className="space-y-2 text-xs">
            {adoptionLogs.map((log: any) => (
              <div key={log.id} className="flex items-center gap-3 text-gray-400">
                <span>{new Date(log.created_at).toLocaleString("ja-JP")}</span>
                <span className={log.action === "ADOPT" ? "text-emerald-400" : "text-red-400"}>
                  {log.action === "ADOPT" ? "採用" : "採用解除"}
                </span>
                {log.offers?.vendor_name && <span>（{log.offers.vendor_name}）</span>}
              </div>
            ))}
            {adoptionLogs.length === 0 && (
              <div className="text-gray-500">履歴がありません</div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {FF_PAGINATION && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {page > 1 && (
              <a
                href={getPageUrl(page - 1)}
                className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5"
              >
                前へ
              </a>
            )}
            <span className="text-sm text-gray-400">
              ページ {page} / {totalPages}
            </span>
            {page < totalPages && (
              <a
                href={getPageUrl(page + 1)}
                className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5"
              >
                次へ
              </a>
            )}
          </div>
        )}
      </div>
    );
  } catch (e: any) {
    console.error("[offers] render error", e);
    return (
      <div className="p-6 text-red-500">
        予期せぬエラーが発生しました。
        <pre className="whitespace-pre-wrap text-xs mt-2">{e?.message ?? String(e)}</pre>
      </div>
    );
  }
}
