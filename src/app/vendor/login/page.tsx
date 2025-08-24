import { getDevSession } from '@/lib/devAuth';
import { getUserRole } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';

export default async function VendorLoginPage() {
  const session = await getDevSession();
  const role = getUserRole(session);

  // 既にログイン済みの場合は/meにリダイレクト
  if (role !== 'guest') {
    redirect('/me');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              事業者ログイン
            </h1>
            <p className="text-gray-600">
              事業者アカウントにログインしてください
            </p>
          </div>

          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="example@company.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="パスワードを入力"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  ログイン状態を保持
                </label>
              </div>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
                パスワードを忘れた方
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              ログイン
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              事業者登録がまだの方は
              <a href="/vendor/register" className="text-blue-600 hover:text-blue-500 font-medium">
                事業者登録
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
