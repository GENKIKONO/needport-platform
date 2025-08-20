"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

function RecoCard({ title, desc }: { title: string; desc: string }) {
  return (
    <Link href="#" className="block np-card-pad bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition">
      <h4 className="font-semibold text-white mb-1">{title}</h4>
      <p className="text-white/80 text-sm">{desc}</p>
    </Link>
  );
}

export default function AudiencePicker(){
  const [active, setActive] = useState<0|1|2>(0);
  const cardsRef = [useRef<HTMLButtonElement>(null), useRef<HTMLButtonElement>(null), useRef<HTMLButtonElement>(null)];
  const recoRef = useRef<HTMLDivElement>(null);

  // 画面幅に応じて再計算
  useEffect(()=>{
    const update = ()=>{
      const card = cardsRef[active].current;
      const reco = recoRef.current;
      if(!card || !reco) return;
      const cardRect = card.getBoundingClientRect();
      const recoRect = reco.getBoundingClientRect();
      const x = cardRect.left + cardRect.width/2 - recoRect.left;
      reco.style.setProperty('--arrow-x', `${x}px`);
    };
    update();
    window.addEventListener('resize', update);
    return ()=>window.removeEventListener('resize', update);
  },[active]);

  return (
    <section className="mt-10" style={{width:'min(1100px, 96vw)', marginInline:'auto'}}>
      {/* カード行—左右の余白を広めに */}
      <div className="grid grid-cols-3 gap-4 md:gap-6">
        {['一般の方へ','企業の方へ','自治体の方へ'].map((label,i)=>(
          <button
            key={label}
            ref={cardsRef[i] as any}
            onClick={()=>setActive(i as 0|1|2)}
            className={`rounded-xl border px-5 py-4 text-[15px] font-semibold
             ${active===i?'border-[var(--np-blue)] text-[var(--np-ink)] bg-white shadow-sm':'border-slate-300 bg-white/70'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 推奨ブロック（青）。幅を検索バー級に拡張 */}
      <div ref={recoRef} className="np-reco mt-4 md:mt-5" style={{width:'100%'}}>
        <h3 className="font-bold mb-3 text-white/95">
          {['一般の方へのおすすめコンテンツ','企業の方へのおすすめコンテンツ','自治体の方へのおすすめコンテンツ'][active]}
        </h3>
        <div className="grid md:grid-cols-3 gap-3">
          <RecoCard title="ニーズ一覧を見る" desc="地域のニーズを探してみよう"/>
          <RecoCard title="使い方ガイド" desc="初めての方へ"/>
          <RecoCard title="よくある質問" desc="Q&Aで解決"/>
        </div>
      </div>
    </section>
  );
}
