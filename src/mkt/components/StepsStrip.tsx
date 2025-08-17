"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Ship, FileText, Handshake, ShieldCheck, MessageSquare, CreditCard, Compass } from "lucide-react";

const STEPS = [
  { key:"post",    label:"投稿",      desc:"困りごとを投稿", ico: FileText },
  { key:"offer",   label:"提案",      desc:"業者から提案",   ico: Handshake },
  { key:"approve", label:"承認",      desc:"良い提案を承認", ico: ShieldCheck },
  { key:"room",    label:"ルーム",    desc:"運営同席で進行", ico: MessageSquare },
  { key:"pay",     label:"支払い",    desc:"安全に決済",     ico: CreditCard },
];

export default function StepsStrip() {
  const [i, setI] = useState(0);

  // 自動でゆっくり巡航
  useEffect(() => {
    const t = setInterval(() => setI((s) => (s + 1) % STEPS.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="section">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Compass className="w-5 h-5 text-sky-600" />
          サービスの流れ
        </h2>
        <Link href="/mkt/how-it-works" className="text-sm text-sky-600 hover:underline">
          詳細を見る →
        </Link>
      </div>
      
      <div className="relative p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100">
        <div className="relative">
          {/* 航路ライン */}
          <div className="h-2 bg-sky-200 rounded-full" />
          
          {/* 港（ドット） */}
          <div className="grid grid-cols-5 mt-4">
            {STEPS.map((s, idx) => (
              <button
                key={s.key}
                className="group flex flex-col items-center gap-2 py-2 focus:outline-none"
                onClick={() => setI(idx)}
                aria-current={i===idx}
              >
                <s.ico className={`h-6 w-6 ${i===idx? "text-sky-600" : "text-neutral-400"} transition-colors`} />
                <div className="text-center">
                  <div className={`text-xs font-medium ${i===idx? "text-sky-700" : "text-neutral-500"}`}>{s.label}</div>
                  <div className={`text-xs ${i===idx? "text-sky-600" : "text-neutral-400"}`}>{s.desc}</div>
                </div>
              </button>
            ))}
          </div>
          
          {/* 船（インジケータ） */}
          <Ship
            className="absolute -top-8 h-8 w-8 text-sky-600 transition-[left] duration-700 ease-in-out"
            style={{ left: `calc(${i} * 20% + 10% - 16px)` }}
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}
