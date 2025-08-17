export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function MePage() {
  return (
    <main className="container py-8 space-y-6">
      <h1 className="text-2xl font-bold">マイページ</h1>
      
      {/* Profile Card */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
            デ
          </div>
          <div>
            <h2 className="text-lg font-semibold">デモユーザー</h2>
            <p className="text-sm text-gray-600">東京都渋谷区</p>
            <p className="text-xs text-gray-500">参加日: 2025/8/17</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">2</div>
          <div className="text-sm text-gray-600">投稿</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">3</div>
          <div className="text-sm text-gray-600">興味表明</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">1</div>
          <div className="text-sm text-gray-600">マッチング</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="font-semibold mb-4">クイックアクション</h3>
        <div className="grid gap-3">
          <a href="/post" className="btn btn-primary">新しいニーズを投稿</a>
          <a href="/needs" className="btn btn-ghost">ニーズを探す</a>
        </div>
      </div>
    </main>
  );
}
