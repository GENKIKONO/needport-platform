export default function DeepGuide() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">ディープな解説</h1>
      <div className="mt-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">専門的な解説</h2>
          <p className="text-slate-700 mb-4">
            NeedPortの詳細な機能と活用方法について、専門的な観点から解説します。
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">技術的な仕組み</h3>
            <ul className="space-y-2 text-slate-700">
              <li>• マッチングアルゴリズムの詳細</li>
              <li>• セキュリティ対策</li>
              <li>• データ保護の仕組み</li>
              <li>• API仕様書</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">ビジネスモデル</h3>
            <ul className="space-y-2 text-slate-700">
              <li>• 収益化の仕組み</li>
              <li>• 成功報酬の計算方法</li>
              <li>• 事業者向けサポート</li>
              <li>• 地域経済への影響</li>
            </ul>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3">統計・分析</h3>
          <div className="bg-slate-50 p-6 rounded-lg">
            <p className="text-slate-700 mb-4">
              プラットフォームの利用状況やマッチング成功率などの詳細な統計情報を公開しています。
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-sky-600">1,234</div>
                <div className="text-sm text-slate-600">登録ニーズ</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">567</div>
                <div className="text-sm text-slate-600">成功マッチング</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">89%</div>
                <div className="text-sm text-slate-600">満足度</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
