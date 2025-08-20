export default function FAQ() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">よくある質問</h1>
      <div className="mt-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">ニーズの投稿について</h2>
          <div className="space-y-3 text-slate-700">
            <div>
              <h3 className="font-medium">Q: 投稿は無料ですか？</h3>
              <p className="text-sm text-slate-600 mt-1">A: はい、ニーズの投稿は完全無料です。</p>
            </div>
            <div>
              <h3 className="font-medium">Q: 投稿したニーズは誰でも見えますか？</h3>
              <p className="text-sm text-slate-600 mt-1">A: 公開設定に応じて表示範囲を調整できます。</p>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">提案について</h2>
          <div className="space-y-3 text-slate-700">
            <div>
              <h3 className="font-medium">Q: 提案は誰でもできますか？</h3>
              <p className="text-sm text-slate-600 mt-1">A: 事業者登録が必要です。</p>
            </div>
            <div>
              <h3 className="font-medium">Q: 提案の手数料はありますか？</h3>
              <p className="text-sm text-slate-600 mt-1">A: 成功報酬型の手数料体系です。</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
