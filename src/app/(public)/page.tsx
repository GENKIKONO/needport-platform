import NeedCard from '@/components/NeedCard';
import TagFacets from '@/components/TagFacets';
import ScaleTabs from '@/components/ScaleTabs';
import { fetchNeedsForList, type NeedRow } from '@/lib/server/queries';
import type { Need, Offer, Membership } from '@/lib/mock/types';
import { supabaseServer } from '@/lib/server/supabase';
import { formatDate } from '@/lib/format';
import { headers } from 'next/headers';
import { DB_ENABLED, DEMO_VISIBLE } from '@/lib/flags';
import HeroSlider from '@/components/home/HeroSlider';
import { getSampleNeeds } from '@/lib/sampleNeeds';

export const revalidate = 60; // 1 minute cache

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const query = sp.q as string | undefined;
  
  // Set cache headers for public pages
  // Note: headers() is read-only in Next.js 15, so we use NextResponse headers in middleware instead
  const tags = Array.isArray(sp.tag) ? sp.tag : sp.tag ? [sp.tag] : [];
  const sort = sp.sort as "new" | "popular" | undefined;
  const scale = sp.scale as "all" | "personal" | "community" | undefined;
  const defaultScale = scale || "all";
  const page = Math.max(1, Number(sp.page) || 1);
  const per = Math.min(48, Math.max(1, Number(sp.per) || 12));
  const offset = (page - 1) * per;

  // Try to fetch from database first
  try {
    const supabase = supabaseServer();
    
    // Get trending needs (top 6 with score = prejoin_count*3 + recent_boost)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: trendingNeeds } = await supabase
      .from("needs")
      .select(`
        id,
        title,
        summary,
        prejoin_count,
        created_at,
        adopted_offer_id,
        min_people,
        deadline,
        price_amount,
        tags
      `)
      .eq("status", "published")
      .is("deleted_at", null)
      .order("prejoin_count", { ascending: false })
      .limit(6);

    // Calculate trending score and sort
    const trendingWithScore = trendingNeeds?.map(need => {
      const recentBoost = new Date(need.created_at) > sevenDaysAgo ? 10 : 0;
      const score = (need.prejoin_count || 0) * 3 + recentBoost;
      return { ...need, score };
    }).sort((a, b) => b.score - a.score).slice(0, 6) || [];
    
    // Get top tags for facets
    const { data: tagData } = await supabase
      .from("needs")
      .select("tags")
      .not("tags", "is", null);

    // Build tag frequency map
    const tagFrequency: Record<string, number> = {};
    tagData?.forEach((need: any) => {
      if (need.tags && Array.isArray(need.tags)) {
        need.tags.forEach((tag: string) => {
          tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
        });
      }
    });

    // Get top 10 tags
    const topTags = Object.entries(tagFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
    
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
        scale,
        macro_fee_hint,
        macro_use_freq,
        macro_area_hint,
        entries(count)
      `);

    // Apply search filter
    if (query?.trim()) {
      baseQuery = baseQuery.or(`title.ilike.%${query.trim()}%,summary.ilike.%${query.trim()}%`);
    }

    // Apply tag filter - for now, skip complex tag filtering
    // TODO: Implement proper tag filtering when needed

    // Apply sorting for data query
    let dataQuery = supabase.from("needs").select("id,title,scale,macro_fee_hint,macro_use_freq,macro_area_hint,created_at,summary,adopted_offer_id,min_people,deadline,price_amount,tags,entries(count)");
    
    // Apply same filters as baseQuery
    if (query?.trim()) {
      dataQuery = dataQuery.or(`title.ilike.%${query.trim()}%,summary.ilike.%${query.trim()}%`);
    }
    
    // Apply scale filter
    if (defaultScale && defaultScale !== "all") {
      // @ts-expect-error - Supabase type issue, will be fixed when types are updated
      dataQuery = dataQuery.eq("scale", defaultScale);
    }
    
    dataQuery = dataQuery.eq("published", true);
    
    if (sort === "popular") {
      dataQuery = dataQuery.order("entries(count)", { ascending: false });
    }
    dataQuery = dataQuery.order("created_at", { ascending: false });

    // Get paginated data with per+1 to detect hasMore
    const { data: needs, error } = await dataQuery
      .range(offset, offset + per);

    if (error) throw error;

    // Compute hasMore and slice to per for display
    const hasMore = needs && needs.length > per;
    const displayNeeds = needs ? needs.slice(0, per) : [];

    if (displayNeeds.length > 0) {
        const needsWithOffers = displayNeeds.map((n: any) => {
          const totalPeople = n.entries?.reduce((sum: number, entry: any) => sum + entry.count, 0) || 0;
          
          const need: Need = {
            id: n.id,
            title: n.title,
            summary: n.summary || "",
            body: '',
            tags: n.tags || [],
            area: '全国対応',
            mode: 'pooled',
            adopted_offer_id: n.adopted_offer_id,
            prejoin_count: totalPeople,
            attachments: [],
            scale: n.scale,
            macro_fee_hint: n.macro_fee_hint,
            macro_use_freq: n.macro_use_freq,
            macro_area_hint: n.macro_area_hint,
          };

          const adoptedOffer: Offer | null = n.adopted_offer_id ? {
            id: n.adopted_offer_id,
            needId: n.id,
            min_people: n.min_people,
            max_people: null,
            deadline: n.deadline || new Date().toISOString(),
            price_type: 'fixed',
            price_value: n.price_amount || 0,
            note: '',
            status: 'adopted',
          } : null;

          const membership: Membership = {
            isGuest: true,
            isUserMember: false,
            isProMember: false,
          };

          return { need, adoptedOffer, membership };
        });

        // Convert trending needs to NeedCard format
        const trendingWithOffers = trendingWithScore.map((n: any) => {
          const need: Need = {
            id: n.id,
            title: n.title,
            summary: n.summary || "",
            body: '',
            tags: n.tags || [],
            area: '全国対応',
            mode: 'pooled',
            adopted_offer_id: n.adopted_offer_id,
            prejoin_count: n.prejoin_count || 0,
            attachments: [],
            scale: n.scale,
            macro_fee_hint: n.macro_fee_hint,
            macro_use_freq: n.macro_use_freq,
            macro_area_hint: n.macro_area_hint,
          };

          const adoptedOffer: Offer | null = n.adopted_offer_id ? {
            id: n.adopted_offer_id,
            needId: n.id,
            min_people: n.min_people,
            max_people: null,
            deadline: n.deadline || new Date().toISOString(),
            price_type: 'fixed',
            price_value: n.price_amount || 0,
            note: '',
            status: 'adopted',
          } : null;

          const membership: Membership = {
            isGuest: true,
            isUserMember: false,
            isProMember: false,
          };

          return { need, adoptedOffer, membership };
        });

                const totalPages = Math.ceil((displayNeeds.length || 0) / per);

      return (
        <main className="container py-8">
          {/* Search and Filters */}
          <div className="mb-8">
            <form method="GET" className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="募集タイトルで検索..."
                  className="w-full rounded-lg bg-zinc-800 px-4 py-2 outline-none ring-1 ring-white/10"
                />
              </div>
              <div>
                <select
                  name="sort"
                  defaultValue={sort || "new"}
                  className="rounded-lg bg-zinc-800 px-4 py-2 outline-none ring-1 ring-white/10"
                >
                  <option value="new">新しい順</option>
                  <option value="popular">人気順</option>
                </select>
              </div>
              <div>
                <button
                  type="submit"
                  className="rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-4 py-2 text-emerald-200 hover:bg-emerald-600/30"
                >
                  検索
                </button>
              </div>
              {(query || sort !== "new" || tags.length > 0) && (
                <a
                  href="/"
                  className="rounded-lg border border-gray-500/40 bg-gray-600/20 px-4 py-2 text-gray-200 hover:bg-gray-600/30"
                >
                  クリア
                </a>
              )}
            </form>
          </div>

          {/* Tag Facets */}
          <TagFacets tags={topTags} selectedTags={tags} />

          {/* Scale Filter */}
          <ScaleTabs currentScale={defaultScale} />

          {/* Trending Section */}
          {trendingWithOffers.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">トレンド</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {trendingWithOffers.map(({ need, adoptedOffer, membership }) => (
                  <NeedCard
                    key={need.id}
                    need={need}
                    adoptedOffer={adoptedOffer}
                    membership={membership}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mb-6 text-sm text-gray-400">
            {displayNeeds.length || 0} 件の募集
          </div>

          {/* Needs Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {needsWithOffers.map(({ need, adoptedOffer, membership }) => (
              <NeedCard
                key={need.id}
                need={need}
                adoptedOffer={adoptedOffer}
                membership={membership}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              {page > 1 && (
                <a
                  href={`/?${(() => {
                    const params = new URLSearchParams();
                    if (query) params.set('q', query);
                    if (sort) params.set('sort', sort);
                    tags.forEach(tag => params.append('tag', tag));
                    params.set('page', String(page - 1));
                    params.set('per', String(per));
                    return params.toString();
                  })()}`}
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
                  href={`/?${(() => {
                    const params = new URLSearchParams();
                    if (query) params.set('q', query);
                    if (sort) params.set('sort', sort);
                    tags.forEach(tag => params.append('tag', tag));
                    params.set('page', String(page + 1));
                    params.set('per', String(per));
                    return params.toString();
                  })()}`}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
                >
                  次へ
                </a>
              )}
            </div>
          )}
        </main>
      );
    }
  } catch (error) {
    console.error("Failed to fetch needs:", error);
  }

  // Fallback to mock data
  const { source, items } = await fetchNeedsForList();

  // DBから取得したデータをNeedCardの形式に変換
  const needsWithOffers = items.map((n: NeedRow) => {
    const need: Need = {
      id: n.id,
      title: n.title,
      summary: n.summary,
      body: '',
      tags: [],
      area: '全国対応',
      mode: 'pooled',
      adopted_offer_id: null,
      prejoin_count: n.prejoin_count ?? 0,
      attachments: [],
      scale: n.scale,
      macro_fee_hint: n.macro_fee_hint,
      macro_use_freq: n.macro_use_freq,
      macro_area_hint: n.macro_area_hint,
    };

    const adoptedOffer: Offer | null = n.min_people ? {
      id: 'temp-offer-id',
      needId: n.id,
      min_people: n.min_people,
      max_people: null,
      deadline: n.deadline || new Date().toISOString(),
      price_type: 'fixed',
      price_value: n.price_amount || 0,
      note: '',
      status: 'adopted',
    } : null;

    const membership: Membership = {
      isGuest: true,
      isUserMember: false,
      isProMember: false,
    };

    return { need, adoptedOffer, membership };
  });

  // Get sample needs for fallback
  const sampleNeeds = getSampleNeeds();
  
  return (
    <>
      <HeroSlider />
      
      {/* もうすぐ成立セクション */}
      <section className="container py-12">
        <div className="card bg-amber-500/10 border-amber-500/20 p-6">
          <h2 className="text-xl font-semibold text-amber-300 mb-4">もうすぐ成立</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sampleNeeds.filter(need => need.currentPeople > 0).slice(0, 3).map((need) => (
              <div key={need.id} className="card p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="chip text-amber-600 bg-amber-100/20">
                    あと{need.targetPeople - need.currentPeople}人
                  </span>
                  <span className="text-xs text-neutral-400">
                    {new Date(need.deadline).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-medium text-white mb-2">{need.title}</h3>
                <div className="progress">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${(need.currentPeople / need.targetPeople) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-neutral-400 mt-2">
                  {need.currentPeople}/{need.targetPeople}人
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* カテゴリーセクション */}
      <section className="container py-12">
        <h2 className="text-xl font-semibold text-white mb-6">カテゴリー</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Webデザイン', 'システム開発', '動画制作', '翻訳', '研修', 'イベント', 'マーケティング', 'その他'].map((category) => (
            <div key={category} className="card p-4 text-center hover:bg-white/10 transition-colors cursor-pointer">
              <div className="text-2xl mb-2">📁</div>
              <div className="text-sm font-medium text-white">{category}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 注目のニーズセクション */}
      <section className="container py-12">
        <h2 className="text-xl font-semibold text-white mb-6">注目のニーズ</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sampleNeeds.slice(0, 6).map((need) => {
            const needData: Need = {
              id: need.id,
              title: need.title,
              summary: need.description,
              body: '',
              tags: [need.category],
              area: need.area,
              mode: 'pooled',
              adopted_offer_id: null,
              prejoin_count: need.currentPeople,
              attachments: [],
              scale: 'personal',
              macro_fee_hint: null,
              macro_use_freq: null,
              macro_area_hint: null,
            };

            const adoptedOffer: Offer | null = need.targetPeople > 1 ? {
              id: 'temp-offer-id',
              needId: need.id,
              min_people: need.targetPeople,
              max_people: null,
              deadline: need.deadline,
              price_type: 'fixed',
              price_value: 0,
              note: '',
              status: 'adopted',
            } : null;

            const membership: Membership = {
              isGuest: true,
              isUserMember: false,
              isProMember: false,
            };

            return (
              <NeedCard
                key={need.id}
                need={needData}
                adoptedOffer={adoptedOffer}
                membership={membership}
              />
            );
          })}
        </div>
      </section>
    </>
  );
}
