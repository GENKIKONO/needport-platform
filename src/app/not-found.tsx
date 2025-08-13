import Link from "next/link";
import ShareButtons from "@/components/ShareButtons";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            ページが見つかりません
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            お探しのページは存在しないか、移動または削除された可能性があります。
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <Link
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ホームに戻る
            </Link>
            
            <Link
              href="/needs"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ニーズ一覧を見る
            </Link>
            
            <Link
              href="/discover"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ディスカバー
            </Link>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">または</span>
              </div>
            </div>

            <div className="mt-6">
              <form className="space-y-6">
                <div>
                  <label htmlFor="search" className="sr-only">
                    検索
                  </label>
                  <div className="relative">
                    <input
                      id="search"
                      name="q"
                      type="text"
                      required
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="ニーズを検索..."
                    />
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    検索
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-6 text-center">
            <ShareButtons
              url={typeof window !== 'undefined' ? window.location.href : 'https://needport.jp'}
              title="NeedPort - 404 Not Found"
              description="ページが見つかりませんでした"
              className="justify-center"
            />
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              問題が解決しない場合は、お気軽にお問い合わせください。
            </p>
            <p className="mt-1">
              <a
                href="mailto:support@needport.jp"
                className="text-blue-600 hover:text-blue-500"
              >
                support@needport.jp
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
