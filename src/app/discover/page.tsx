import NeedCard from "@/components/NeedCard";
import { supabaseServer } from "@/lib/server/supabase";
import { formatDate } from "@/lib/format";
import type { Need, Offer, Membership } from "@/lib/mock/types";

export const dynamic = "force-dynamic";
export const revalidate = 60; // 1 minute cache

// Helper function to normalize location
function normalizeLocation(location: string | null): string {
  if (!location) return "全国";
  
  const normalized = location.trim();
  if (normalized.includes("県") || normalized.includes("都") || normalized.includes("府")) {
    return normalized;
  }
  
  // Map common city names to prefectures
  const cityToPrefecture: Record<string, string> = {
    "東京": "東京都",
    "大阪": "大阪府",
    "京都": "京都府",
    "横浜": "神奈川県",
    "名古屋": "愛知県",
    "札幌": "北海道",
    "福岡": "福岡県",
    "仙台": "宮城県",
    "広島": "広島県",
    "高知": "高知県",
  };
  
  return cityToPrefecture[normalized] || normalized;
}

// Helper function to get price band
function getPriceBand(amount: number | null): string {
  if (!amount) return "未設定";
  if (amount < 100000) return "0-99k";
  if (amount < 300000) return "100-299k";
  if (amount < 1000000) return "300-999k";
  return "1M+";
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  try {
    const sp = await searchParams;
    const tag = sp.tag as string | undefined;
    const area = sp.area as string | undefined;
    const priceBand = sp.priceBand as string | undefined;
    const page = Math.max(1, Number(sp.page) || 1);
    const per = Math.min(48, Math.max(1, Number(sp.per) || 12));
    const offset = (page - 1) * per;

    const supabase = supabaseServer();

    // Get aggregations for filters
    const { data: allNeeds } = await supabase
      .from("needs")
      .select("tags, location, price_amount")
      .eq("status", "published")
      .is("deleted_at", null);

    // Build tag frequency map
    const tagFrequency: Record<string, number> = {};
    const areaFrequency: Record<string, number> = {};
    const priceBandFrequency: Record<string, number> = {};

    allNeeds?.forEach((need: any) => {
      // Count tags
      if (need.tags && Array.isArray(need.tags)) {
        need.tags.forEach((tag: string) => {
          tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
        });
      }

      // Count areas
      const normalizedArea = normalizeLocation(need.location);
      areaFrequency[normalizedArea] = (areaFrequency[normalizedArea] || 0) + 1;

      // Count price bands
      const band = getPriceBand(need.price_amount);
      priceBandFrequency[band] = (priceBandFrequency[band] || 0) + 1;
    });

    // Get top tags (20)
    const topTags = Object.entries(tagFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));

    // Get top areas
    const topAreas = Object.entries(areaFrequency)
      .sort(([, a], [, b]) => b - a)
      .map(([area, count]) => ({ area, count }));

    // Get price bands
    const priceBands = [
      { band: "0-99k", label: "10万円未満" },
      { band: "100-299k", label: "10-30万円" },
      { band: "300-999k", label: "30-100万円" },
      { band: "1M+", label: "100万円以上" },
      { band: "未設定", label: "未設定" },
    ];

    // Build base query
    let baseQuery = supabase
      .from("needs")
      .select(`
        id,
        title,
        summary,
        created_at,
        adopted_offer_id,
        min_people,
        deadline,
        price_amount,
        tags,
        location,
        entries(count)
      `)
      .eq("status", "published")
      .is("deleted_at", null);

    // Apply filters
    if (tag) {
      baseQuery = baseQuery.contains("tags", [tag]);
    }

    if (area && area !== "全国") {
      baseQuery = baseQuery.ilike("location", `%${area}%`);
    }

    if (priceBand && priceBand !== "未設定") {
      if (priceBand === "0-99k") {
        baseQuery = baseQuery.lt("price_amount", 100000);
      } else if (priceBand === "100-299k") {
        baseQuery = baseQuery.gte("price_amount", 100000).lt("price_amount", 300000);
      } else if (priceBand === "300-999k") {
        baseQuery = baseQuery.gte("price_amount", 300000).lt("price_amount", 1000000);
      } else if (priceBand === "1M+") {
        baseQuery = baseQuery.gte("price_amount", 1000000);
      }
    }

    // Get total count
    // @ts-expect-error - Supabase type issue, will be fixed when types are updated
    const { count } = await baseQuery.select("id", { count: "exact", head: true });

    // Get paginated data
    const { data: needs, error } = await baseQuery
      .order("created_at", { ascending: false })
      .range(offset, offset + per - 1);

    if (error) throw error;

    const needsWithOffers = needs?.map((n: any) => {
      const totalPeople = n.entries?.reduce((sum: number, entry: any) => sum + entry.count, 0) || 0;
      
      const need: Need = {
        id: n.id,
        title: n.title,
        summary: n.summary || "",
        body: "",
        tags: n.tags || [],
        area: normalizeLocation(n.location),
        mode: "pooled",
        adopted_offer_id: n.adopted_offer_id,
        prejoin_count: totalPeople,
        attachments: [],
      };

      const adoptedOffer: Offer | null = n.adopted_offer_id ? {
        id: n.adopted_offer_id,
        needId: n.id,
        min_people: n.min_people,
        max_people: null,
        deadline: n.deadline || new Date().toISOString(),
        price_type: "fixed",
        price_value: n.price_amount || 0,
        note: "",
        status: "adopted",
      } : null;

      const membership: Membership = {
        isGuest: true,
        isUserMember: false,
        isProMember: false,
      };

      return { need, adoptedOffer, membership };
    }) || [];

    const totalPages = Math.ceil((count || 0) / per);

    const getFilterUrl = (newParams: Record<string, string>) => {
      const params = new URLSearchParams();
      if (tag) params.set("tag", tag);
      if (area) params.set("area", area);
      if (priceBand) params.set("priceBand", priceBand);
      params.set("page", "1");
      params.set("per", String(per));
      
      Object.entries(newParams).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      
      return `?${params.toString()}`;
    };

    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">募集を探す</h1>
          <p className="text-gray-400">タグ、エリア、金額帯で絞り込んで募集を探しましょう</p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-6">
          {/* Tags */}
          <div>
            <h2 className="text-lg font-semibold mb-3">タグ</h2>
            <div className="flex flex-wrap gap-2">
              <a
                href={getFilterUrl({ tag: "" })}
                className={`px-3 py-1 rounded-full text-sm border ${
                  !tag
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-transparent text-gray-300 border-gray-600 hover:border-gray-500"
                }`}
              >
                すべて
              </a>
              {topTags.map(({ tag: tagName, count }) => (
                <a
                  key={tagName}
                  href={getFilterUrl({ tag: tagName })}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    tag === tagName
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-transparent text-gray-300 border-gray-600 hover:border-gray-500"
                  }`}
                >
                  {tagName} ({count})
                </a>
              ))}
            </div>
          </div>

          {/* Areas */}
          <div>
            <h2 className="text-lg font-semibold mb-3">エリア</h2>
            <div className="flex flex-wrap gap-2">
              <a
                href={getFilterUrl({ area: "" })}
                className={`px-3 py-1 rounded-full text-sm border ${
                  !area
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-transparent text-gray-300 border-gray-600 hover:border-gray-500"
                }`}
              >
                すべて
              </a>
              {topAreas.slice(0, 15).map(({ area: areaName, count }) => (
                <a
                  key={areaName}
                  href={getFilterUrl({ area: areaName })}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    area === areaName
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-transparent text-gray-300 border-gray-600 hover:border-gray-500"
                  }`}
                >
                  {areaName} ({count})
                </a>
              ))}
            </div>
          </div>

          {/* Price Bands */}
          <div>
            <h2 className="text-lg font-semibold mb-3">金額帯</h2>
            <div className="flex flex-wrap gap-2">
              <a
                href={getFilterUrl({ priceBand: "" })}
                className={`px-3 py-1 rounded-full text-sm border ${
                  !priceBand
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-transparent text-gray-300 border-gray-600 hover:border-gray-500"
                }`}
              >
                すべて
              </a>
              {priceBands.map(({ band, label }) => (
                <a
                  key={band}
                  href={getFilterUrl({ priceBand: band })}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    priceBand === band
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-transparent text-gray-300 border-gray-600 hover:border-gray-500"
                  }`}
                >
                  {label} ({priceBandFrequency[band] || 0})
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              検索結果 ({count || 0} 件)
            </h2>
            {(tag || area || priceBand) && (
              <a
                href="/discover"
                className="text-sm text-emerald-400 hover:text-emerald-300"
              >
                フィルターをクリア
              </a>
            )}
          </div>

          {needsWithOffers.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                該当する募集がありません
              </h3>
              <p className="text-gray-400 mb-4">
                条件を変更して再度お試しください
              </p>
              <a
                href="/discover"
                className="inline-flex items-center rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-600/30"
              >
                フィルターをクリア
              </a>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {needsWithOffers.map(({ need, adoptedOffer, membership }) => (
                <NeedCard
                  key={need.id}
                  need={need}
                  adoptedOffer={adoptedOffer}
                  membership={membership}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            {page > 1 && (
              <a
                href={getFilterUrl({ page: String(page - 1) })}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
              >
                前へ
              </a>
            )}
            <span className="text-sm text-gray-400">
              ページ {page} / {totalPages}
            </span>
            {page < totalPages && (
              <a
                href={getFilterUrl({ page: String(page + 1) })}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
              >
                次へ
              </a>
            )}
          </div>
        )}
      </main>
    );
  } catch (error) {
    console.error("Failed to fetch needs for discover:", error);
    return (
      <div className="p-6 text-red-500">
        データの取得に失敗しました。
        <pre className="whitespace-pre-wrap text-xs mt-2">{String(error)}</pre>
      </div>
    );
  }
}
