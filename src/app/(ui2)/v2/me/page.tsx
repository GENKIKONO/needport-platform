export default function MeTop() {
  return <div className="space-y-4">
    <h1 className="text-xl font-bold">マイページ</h1>
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="card p-4">閲覧解放済み件数: --</div>
      <div className="card p-4">アカウント完成度: --%</div>
    </div>
  </div>
}
