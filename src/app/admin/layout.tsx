import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/admin" className="text-xl font-bold text-gray-900">
                  Admin Panel
                </Link>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-4">
                <Link href="/admin" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                  ダッシュボード
                </Link>
                <Link href="/admin/data" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                  データ管理
                </Link>
                <Link href="/admin/users" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                  ユーザー管理
                </Link>
                <Link href="/admin/settings" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                  設定
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                サイトに戻る
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}