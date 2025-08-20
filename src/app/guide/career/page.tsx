export default function CareerGuide() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">運命の仕事</h1>
      <div className="mt-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">キャリア形成支援</h2>
          <p className="text-slate-700 mb-4">
            NeedPortを通じて、あなたの「運命の仕事」を見つけましょう。
          </p>
          <ul className="space-y-2 text-slate-700">
            <li>• 地域のニーズに応えることで新しいキャリアの可能性を発見</li>
            <li>• スキルを活かした副業・フリーランス活動の始め方</li>
            <li>• 地域密着型の仕事で安定した収入を得る方法</li>
            <li>• 転職・独立を目指す方へのサポート</li>
          </ul>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">成功事例</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">ITエンジニアの副業</h3>
              <p className="text-sm text-slate-600">地域のデジタル化支援で月10万円の副収入を実現</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">デザイナーの独立</h3>
              <p className="text-sm text-slate-600">地域企業のブランディングでフリーランスとして成功</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
