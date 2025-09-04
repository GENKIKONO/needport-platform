export default function VendorsIndex(){
  return <div className="mx-auto max-w-6xl p-6 space-y-6">
    <h1 className="text-2xl font-bold">事業者一覧</h1>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="border rounded p-4 space-y-2">
        <h3 className="font-semibold">サンプル事業者</h3>
        <p className="text-sm text-slate-600">リフォーム・建築</p>
        <p className="text-xs text-slate-500">対応エリア: 東京都</p>
        <a href="/vendors/1" className="text-sm px-2 py-1 rounded border inline-block">詳細を見る</a>
      </div>
    </div>
  </div>;
}
