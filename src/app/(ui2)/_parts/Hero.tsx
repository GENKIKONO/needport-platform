"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-14 md:py-20">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
            埋もれた声を、つなぐ。形にする。
          </h1>
          <p className="mt-4 md:mt-6 text-slate-600 text-base md:text-lg leading-relaxed">
            NeedPortは、<span className="font-semibold">匿名で条件を合わせてから顔合わせ</span>することで、
            しがらみを避けた<span className="font-semibold">フラットなマッチング</span>を実現します。
            小さな声を束ね、事業者の提案とつないで、実現まで伴走します。
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/needs" className="inline-flex items-center rounded-md bg-slate-900 text-white px-4 py-2 text-sm md:text-base hover:bg-slate-800">
              ニーズを探す
            </Link>
            <Link href="/needs/new" className="inline-flex items-center rounded-md bg-white border px-4 py-2 text-sm md:text-base hover:bg-slate-50">
              ニーズを投稿する
            </Link>
          </div>
          <div className="mt-4 text-xs text-slate-500">
            成約時10%（業種によりサブスク/対象外あり）。個人情報は承認・成約まで非開示。
          </div>
        </div>
      </div>
    </section>
  );
}
