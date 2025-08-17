"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getNeedByIdSafe } from "@/lib/demo/data";
import NeedInterestMeter from "@/components/NeedInterestMeter";
import OffersList from "@/components/OffersList";
import OfferForm from "@/components/OfferForm";
import InterestDialog from "@/components/InterestDialog";

export default function NeedDetail({params}:{params:{id:string}}){
  const [need, setNeed] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [endorsed, setEndorsed] = useState(false);

  // データ取得
  useState(() => {
    getNeedByIdSafe(params.id).then(setNeed);
  });

  // 賛同済み状態チェック
  useEffect(() => {
    if (typeof window !== "undefined") {
      setEndorsed(!!localStorage.getItem(`np_endorsed_${params.id}`));
    }
  }, [params.id]);

  function handleDone(newCounts?: Record<string,number>) {
    setEndorsed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(`np_endorsed_${params.id}`, "1");
    }
    // カウント更新（楽観的更新）
    if (newCounts && need) {
      setNeed(prev => ({ ...prev, counts: newCounts }));
    }
  }
  if(!need){ // 赤エラー回避：静かな404
    return (
      <main className="section">
        <div className="np-card p-6 text-center">
          <h1 className="text-xl font-bold text-gray-900">ニーズが見つかりませんでした</h1>
          <p className="mt-2 text-sm text-gray-600">URLを確認するか、一覧から探してみてください。</p>
          <div className="mt-4 flex gap-2 justify-center">
            <Link className="btn btn-primary" href="/needs">一覧へ</Link>
            <Link className="btn btn-ghost" href="/">ホームへ</Link>
          </div>
        </div>
      </main>
    );
  }
  
  // Mock interest data
  const interestData = {
    buyCount: Math.floor(need.count * 0.4),
    maybeCount: Math.floor(need.count * 0.3),
    interestCount: Math.floor(need.count * 0.3),
    totalCount: need.count
  };
  
  return (
    <main className="section space-y-6">
      <div className="np-card p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{need.title}</h1>
        
        {/* Interest Meter */}
        <div className="mb-6">
          <NeedInterestMeter {...interestData} />
        </div>
        
        <p className="text-gray-700 leading-7 mb-6">{need.description}</p>
        
        {/* Meta info */}
        <div className="flex items-center gap-2 mb-6">
          <span className="np-badge bg-blue-100 text-blue-800">{need.category}</span>
          <span className="np-badge bg-gray-100 text-gray-600">{need.area}</span>
        </div>
        
        <div className="flex gap-2">
          <button 
            type="button" 
            disabled={endorsed}
            className={`btn btn-primary h-11 text-base ${endorsed ? "opacity-60 cursor-default" : ""}`}
            onClick={() => setOpenDialog(true)}
          >
            {endorsed ? "賛同済み" : "賛同して参加する"}
          </button>
          <Link href="/needs" className="btn btn-ghost h-11 text-base">
            一覧へ
          </Link>
        </div>
      </div>

      {/* 提案する */}
      <section className="section">
        <div className="np-card p-6">
          <h3 className="font-semibold mb-4">提案する</h3>
          <OfferForm needId={params.id} onSuccess={() => {
            // 提案一覧を再取得
            const offersList = document.querySelector('[data-offers-list]') as any;
            if (offersList?.fetchOffers) {
              offersList.fetchOffers();
            }
          }} />
        </div>
      </section>

      {/* 提案一覧 */}
      <section className="section">
        <OffersList needId={params.id} isOwner={need.owner_ref === 'demo_user'} />
      </section>

      {openDialog && need && (
        <InterestDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onDone={handleDone}
          need={{ id: need.id, title: need.title, area: need.area, category: need.category, budgetLabel: need.budgetLabel }}
        />
      )}
    </main>
  );
}
