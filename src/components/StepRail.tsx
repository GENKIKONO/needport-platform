import { Compass, Users, Handshake, Store, BadgeCheck } from "lucide-react";

const STEPS = [
  { icon: Store,      title:"アカウント登録", desc:"まずは無料アカウント登録。ニックネーム運用でOK。", tint:"from-violet-50" },
  { icon: Compass,    title:"ニーズを投稿",   desc:"困りごとや目的を整理し、具体的な「欲しい」に。",       tint:"from-emerald-50" },
  { icon: Users,      title:"仲間を集める",   desc:"関心の可視化で仲間と合意形成。需要を見える化。",         tint:"from-amber-50" },
  { icon: Handshake,  title:"企業からアプローチ", desc:"提案→承認で案件ルームへ。承認制チャットで安全に進行。", tint:"from-indigo-50" },
  { icon: BadgeCheck, title:"夢が現実に",     desc:"与信（Stripe）で安心決済。成果を受け取り完了。",          tint:"from-rose-50" },
];

export default function StepRail() {
  return (
    <section className="relative mt-10">
      {/* dotted route behind cards (md+) */}
      <svg aria-hidden className="decoration absolute inset-x-6 top-14 hidden md:block h-8" viewBox="0 0 1000 64" fill="none">
        <path d="M10,32 H990" stroke="currentColor" className="text-sky-900/10" strokeWidth="2" strokeDasharray="6 10" strokeLinecap="round"/>
      </svg>

      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STEPS.map(({icon:Icon, title, desc, tint}, i) => (
          <li key={title} className={`step-card bg-gradient-to-b ${tint} to-white`}>
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold">{i+1}</span>
              <div className="mt-0.5">
                <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                  <Icon className="w-4 h-4 text-neutral-500" /> {title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-700">{desc}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
