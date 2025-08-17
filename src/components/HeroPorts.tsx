"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Ship, FileText, Handshake, MessageSquare, ShieldCheck, CreditCard } from "lucide-react";
import FlowStrip from "./FlowStrip";

const STEPS = [
  { key:"post",    label:"投稿",      desc:"困りごとを投稿。個人情報は書かない", ico: FileText },
  { key:"offer",   label:"提案",      desc:"業者から見積や方法の提案が届く",   ico: Handshake },
  { key:"approve", label:"承認",      desc:"良い提案だけを承認して前進",       ico: ShieldCheck },
  { key:"room",    label:"ルーム",    desc:"運営同席の承認制チャットで詰める", ico: MessageSquare },
  { key:"pay",     label:"支払い",    desc:"Stripeで安全に決済・受け渡し",     ico: CreditCard },
];

export default function HeroPorts() {
  const [i, setI] = useState(0);

  // 自動でゆっくり巡航（操作すれば停止）
  useEffect(() => {
    const t = setInterval(() => setI((s) => (s + 1) % STEPS.length), 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative overflow-hidden rounded-2xl hero-mint px-6 py-14 md:py-18">
      {/* ライトな波背景 */}
      <svg className="absolute inset-0 w-full h-full opacity-[.10] pointer-events-none" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden>
        <path d="M0,260 C200,220 400,300 600,260 C800,220 1000,300 1200,260 L1200,400 L0,400 Z" fill="#3b82f6"/>
      </svg>

      <div className="relative max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-balance">
          NeedPort は「ニーズの港」
        </h1>
        <p className="mt-4 text-[16px] sm:text-lg md:text-xl text-neutral-700 text-balance">
          投稿 → 提案 → 承認 → ルーム → 安全な支払い。ここで完結。
        </p>

        {/* 直感フロー（クラファン否定を言葉にしない） */}
        <div className="mt-6">
          <FlowStrip />
        </div>

        {/* CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/post" className="btn btn-primary h-11 text-base btn-wave">ニーズを投稿</Link>
          <Link href="/guide" className="btn btn-ghost h-11 text-base">流れを見る</Link>
        </div>
      </div>
    </section>
  );
}
