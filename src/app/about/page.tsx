export default function About(){
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">このサイトについて</h1>
      <div className="mt-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">NeedPortとは</h2>
          <p className="text-slate-700">
            NeedPortは、地域のニーズと解決策をつなぐプラットフォームです。
            生活者、事業者、自治体が協力して地域の課題を解決し、より良い社会づくりを目指しています。
          </p>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">私たちの使命</h2>
          <p className="text-slate-700">
            地域の小さなニーズから大きな社会課題まで、すべての「欲しい」を形にし、
            地域の力を最大限に活かすことで、持続可能な社会の実現を目指します。
          </p>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">お問い合わせ</h2>
          <p className="text-slate-700">
            ご質問やご意見がございましたら、<a href="/support" className="text-sky-600">無料相談</a>からお気軽にお問い合わせください。
          </p>
        </div>
      </div>
    </main>
  );
}
