export const dynamic = 'force-dynamic';
export const revalidate = 0;

const steps = [
  {
    id: 1,
    title: 'ニーズの発見',
    description: '困りごとや課題を明確に整理し、具体的なニーズとして定義します。',
    icon: '🔍',
  },
  {
    id: 2,
    title: 'マッチング',
    description: 'ニーズに最適なパートナーやサービスを自動でマッチングします。',
    icon: '🤝',
  },
  {
    id: 3,
    title: '提案・検討',
    description: '複数の提案を比較検討し、最適なソリューションを選択します。',
    icon: '📋',
  },
  {
    id: 4,
    title: '契約・開始',
    description: '安全な契約プロセスを経て、プロジェクトを開始します。',
    icon: '📝',
  },
  {
    id: 5,
    title: '完了・評価',
    description: 'プロジェクト完了後、成果を評価し次回への改善点を整理します。',
    icon: '✅',
  },
];

export default function GuidePage() {
  return (
    <div className="container py-12">
      {/* Hero */}
      <section className="text-center mb-16">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-3xl opacity-10" />
          <div className="relative p-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              サービス航海図
            </h1>
            <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
              NeedPort でのサービス利用から完了まで、5つのステップで安全・安心なビジネス体験を提供します
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="space-y-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-6">
            {/* Step Number */}
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-xl">
              {step.id}
            </div>

            {/* Step Content */}
            <div className="flex-1">
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{step.icon}</span>
                  <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                </div>
                <p className="text-neutral-300 leading-relaxed">{step.description}</p>
              </div>
            </div>

            {/* Arrow (except last) */}
            {index < steps.length - 1 && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-neutral-400">
                ↓
              </div>
            )}
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="text-center mt-16">
        <div className="card bg-gradient-to-r from-brand-500/10 to-emerald-500/10 border-brand-500/20 p-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            今すぐ始めましょう
          </h2>
          <p className="text-neutral-300 mb-6">
            あなたのニーズに最適なパートナーを見つけます
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/needs" className="btn btn-primary">
              ニーズを探す
            </a>
            <a href="/needs/new" className="btn btn-ghost">
              ニーズを投稿
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
