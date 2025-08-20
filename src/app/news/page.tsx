export default function News(){
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">お知らせ</h1>
      <div className="mt-6 space-y-4">
        <div className="border-b pb-4">
          <div className="text-sm text-gray-500">2024年12月</div>
          <h3 className="font-semibold mt-1">NeedPortが正式リリースされました</h3>
          <p className="text-sm text-gray-600 mt-1">地域のニーズと解決策をつなぐプラットフォームがスタートしました。</p>
        </div>
        <div className="border-b pb-4">
          <div className="text-sm text-gray-500">2024年11月</div>
          <h3 className="font-semibold mt-1">ベータ版の運用を開始</h3>
          <p className="text-sm text-gray-600 mt-1">限定ユーザーによるベータテストが始まりました。</p>
        </div>
      </div>
    </main>
  );
}
