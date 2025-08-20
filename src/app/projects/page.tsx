export default function Projects() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">プロジェクト一覧</h1>
      <div className="mt-6 space-y-6">
        <div className="bg-slate-100 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h2 className="text-lg font-semibold mb-2">プロジェクト準備中</h2>
          <p className="text-slate-600">支援対象のプロジェクトを確認できます。</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold mb-2">地域活性化プロジェクト</h3>
            <p className="text-sm text-slate-600 mb-4">高知県内での地域活性化</p>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">技術支援</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">進行中</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold mb-2">デジタル化支援</h3>
            <p className="text-sm text-slate-600 mb-4">IT導入のサポート</p>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">技術支援</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">募集中</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
