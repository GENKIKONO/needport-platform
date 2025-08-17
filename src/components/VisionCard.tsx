import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function VisionCard() {
  return (
    <section className="section">
      <div className="rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 text-white p-8 md:p-12 shadow-card">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-white/90">
            <Sparkles className="w-5 h-5" />
            NeedPortが描く未来
          </div>
          <h3 className="mt-2 text-3xl font-bold">リアルなニーズが、新しい経済の出発点に</h3>
          <p className="mt-3 text-white/90 leading-relaxed">
            これはクラウドファンディングでも、既存のBtoBマッチングでもない。
            「ニーズが可視化」されることで、安心して提案と取引が進む新しい形です。
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/post" className="btn h-11 text-base bg-white text-neutral-900 hover:bg-white/90">ニーズを投稿</Link>
            <Link href="/needs" className="btn btn-ghost h-11 text-base border-white/40 text-white hover:bg-white/10">ニーズを探す</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
