export const dynamic = "force-dynamic";
export const revalidate = 0;

import { supabaseServer } from "@/lib/server/supabase";
import EntryForm from "@/components/EntryForm";
import ShareActions from "@/components/ShareActions";
import { FF_PUBLIC_ENTRY } from "@/lib/flags";
import { Metadata } from "next";
import SeoJsonLd from "@/components/SeoJsonLd";
import { SCALE_LABEL, isCommunity } from "@/lib/domain/need";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params;
    const supabase = supabaseServer();
    
    const { data: need } = await supabase
      .from("needs")
      .select("title")
      .eq("id", id)
      .single();

    if (!need) {
      return {
        title: "募集が見つかりません | NeedPort",
      };
    }

    const title = `${need.title} | NeedPort`;
    const description = need.title.length > 160 ? need.title.substring(0, 157) + "..." : need.title;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${siteUrl}/needs/${id}`,
        images: [`${siteUrl}/og/need/${id}`],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [`${siteUrl}/og/need/${id}`],
      },
    };
  } catch (error) {
    return {
      title: "募集 | NeedPort",
    };
  }
}

type NeedWithOffer = {
  id: string;
  title: string;
  summary?: string;
  adopted_offer_id: string | null;
  min_people: number | null;
  deadline: string | null;
  recruitment_closed?: boolean;
  scale: 'personal' | 'community';
  macro_fee_hint?: string | null;
  macro_use_freq?: string | null;
  macro_area_hint?: string | null;
  vendor_name?: string | null;
  amount?: number | null;
};

export default async function NeedDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const supabase = supabaseServer();

    // Fetch need with optional offer data and entries count
    const { data: need, error } = await supabase
      .from("needs")
      .select(`
        id,
        title,
        adopted_offer_id,
        min_people,
        deadline,
        recruitment_closed,
        scale,
        macro_fee_hint,
        macro_use_freq,
        macro_area_hint,
        offers!inner(
          vendor_name,
          amount
        )
      `)
      .eq("id", id)
      .eq("offers.id", "adopted_offer_id")
      .single();

    // Get total entries count if adopted
    let totalPeople = 0;
    if (need?.adopted_offer_id) {
      const { data: entriesSum } = await supabase
        .from("entries")
        .select("count")
        .eq("need_id", id);
      
      totalPeople = entriesSum?.reduce((sum, entry) => sum + entry.count, 0) || 0;
    }

    if (error) {
      // Try without offer join if no adopted offer
      const { data: needOnly, error: needError } = await supabase
        .from("needs")
        .select("id, title, adopted_offer_id, min_people, deadline, recruitment_closed")
        .eq("id", id)
        .single();

      if (needError) {
        return (
          <div className="p-6 text-red-500">
            ニーズが見つかりませんでした。
            <pre className="whitespace-pre-wrap text-xs mt-2">{needError.message}</pre>
          </div>
        );
      }

      const needData: NeedWithOffer = needOnly;
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const currentUrl = `${siteUrl}/needs/${id}`;
      
      return (
        <div className="p-6 space-y-4">
          <h1 className="text-2xl font-semibold">{needData.title}</h1>
          <ShareActions title={needData.title} url={currentUrl} />
          
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-gray-600/20 px-3 py-1 text-sm text-gray-300">
              未採用
            </span>
          </div>
        </div>
      );
    }

    const needData: NeedWithOffer = {
      ...need,
      vendor_name: need.offers?.[0]?.vendor_name,
      amount: need.offers?.[0]?.amount,
    };

    const nf = new Intl.NumberFormat("ja-JP");
    const isDeadlinePassed = needData.deadline ? new Date(needData.deadline) < new Date() : false;
    const remainingPeople = needData.min_people ? Math.max(needData.min_people - totalPeople, 0) : 0;
    const progressPercentage = needData.min_people ? Math.min((totalPeople / needData.min_people) * 100, 100) : 0;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const currentUrl = `${siteUrl}/needs/${id}`;

    return (
      <>
        <SeoJsonLd 
          type="need" 
          needData={{
            id: needData.id,
            title: needData.title,
            summary: needData.summary,
            adopted_offer_id: needData.adopted_offer_id,
            price_amount: needData.amount,
            vendor_name: needData.vendor_name
          }}
        />
        <div className="container space-y-4">
          <h1 className="text-2xl font-semibold">{needData.title}</h1>
          <ShareActions title={needData.title} url={currentUrl} />
        
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-emerald-600/20 px-3 py-1 text-sm text-emerald-300">
            採用済み
          </span>
          <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 text-xs font-medium">
            {SCALE_LABEL[needData.scale as 'personal'|'community']}
          </span>
          <div className="text-sm">
            {needData.vendor_name} / {needData.amount?.toLocaleString("ja-JP")} 円
          </div>
        </div>
        
        {/* Community hints block */}
        {isCommunity(needData.scale) && (needData.macro_fee_hint || needData.macro_use_freq || needData.macro_area_hint) && (
          <div className="card mt-4">
            <h3 className="font-medium mb-3 text-gray-700">概要</h3>
            <div className="space-y-2">
              {needData.macro_fee_hint && (
                <div><span className="font-medium">会費目安:</span> {needData.macro_fee_hint}</div>
              )}
              {needData.macro_use_freq && (
                <div><span className="font-medium">利用頻度:</span> {needData.macro_use_freq}</div>
              )}
              {needData.macro_area_hint && (
                <div><span className="font-medium">対象エリア:</span> {needData.macro_area_hint}</div>
              )}
            </div>
          </div>
        )}

        {/* Recruitment Information Card */}
        {needData.adopted_offer_id && (
          <div className="card mt-6">
            <h3 className="font-medium">募集情報</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">採用オファー:</span>
                <span className="text-sm">
                  {needData.vendor_name} / {nf.format(needData.amount ?? 0)} 円
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">進捗:</span>
                <span className="text-sm">
                  {totalPeople} / {needData.min_people ?? "未設定"}
                </span>
              </div>
              
              {needData.min_people && (
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">締切:</span>
                <span className={`text-sm ${isDeadlinePassed ? "text-red-400" : ""}`}>
                  {needData.deadline ? (
                    isDeadlinePassed ? "締切済み" : needData.deadline
                  ) : "未設定"}
                </span>
              </div>
              
              {needData.min_people && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">残り人数:</span>
                  <span className="text-sm">{remainingPeople} 人</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Show entry form or closed message */}
        {needData.adopted_offer_id && (
          <>
            {!needData.recruitment_closed && !isDeadlinePassed && 
             (needData.min_people ? totalPeople < needData.min_people : true) && 
             FF_PUBLIC_ENTRY ? (
              <div className="mt-6">
                <EntryForm needId={id} />
              </div>
            ) : (
              <div className="card mt-6 border-red-500/40 bg-red-600/20 text-red-200">
                <h3 className="font-medium mb-2">募集は終了しました</h3>
                <p className="text-sm mb-3">
                  {needData.recruitment_closed ? "管理者による終了" :
                   isDeadlinePassed ? "締切超過" :
                   needData.min_people && totalPeople >= needData.min_people ? "目標達成" :
                   "募集終了"}
                </p>
                <a 
                  href="/needs" 
                  className="text-sm underline hover:no-underline"
                >
                  他の募集を探す
                </a>
              </div>
            )}
          </>
        )}
      </div>
      </>
    );
  } catch (e: any) {
    return (
      <div className="p-6 text-red-500">
        予期せぬエラーが発生しました。
        <pre className="whitespace-pre-wrap text-xs mt-2">{e?.message ?? String(e)}</pre>
      </div>
    );
  }
}
