export default function SuccessStories() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">成功事例記事</h1>
      <div className="mt-6 space-y-6">
        <div className="bg-slate-100 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">📄</div>
          <h2 className="text-lg font-semibold mb-2">事例記事準備中</h2>
          <p className="text-slate-600">実際のマッチング成功事例を紹介します。</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold mb-2">地域活性化プロジェクト</h3>
            <p className="text-sm text-slate-600">高知県内での成功事例</p>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold mb-2">デジタル化支援</h3>
            <p className="text-sm text-slate-600">IT導入の成功事例</p>
          </div>
        </div>
      </div>
    </main>
  );
}
