import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";

export default async function MePage(){
  const { userId } = auth();
  const user = await currentUser();

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/20 via-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-2xl font-bold text-slate-800">ログインが必要です</h1>
          <p className="text-slate-600">マイページをご利用いただくには、ログインが必要です</p>
          <Link 
            href="/sign-in" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            ログインする
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">マイページ</h1>
                <p className="text-lg text-gray-600 mt-1">こんにちは、{user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'ユーザー'}さん</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-none">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* サイドナビ */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-sm p-4 space-y-2">
              <Link href="/me/transactions" className="flex items-center gap-3 px-4 py-3 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                取引管理
              </Link>
              <Link href="/me/payments" className="flex items-center gap-3 px-4 py-3 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                決済・領収書
              </Link>
              <Link href="/me/messages" className="flex items-center gap-3 px-4 py-3 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                チャット履歴
              </Link>
              <Link href="/me/posts" className="flex items-center gap-3 px-4 py-3 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                投稿管理
              </Link>
              <Link href="/me/applications" className="flex items-center gap-3 px-4 py-3 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                応募案件
              </Link>
              <Link href="/me/profile" className="flex items-center gap-3 px-4 py-3 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                プロフィール
              </Link>
              <Link href="/me/settings" className="flex items-center gap-3 px-4 py-3 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                設定
              </Link>
            </nav>
          </div>

          {/* メインコンテンツ */}
          <div className="lg:col-span-3">
            {/* ダッシュボード概要 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-base font-medium text-gray-500 truncate">進行中の取引</dt>
                      <dd className="text-2xl font-bold text-gray-900">3</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-base font-medium text-gray-500 truncate">投稿したニーズ</dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        <span className="text-sm text-green-600">アクティブ: 2</span>
                        <span className="block text-sm text-gray-500">完了: 3</span>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-base font-medium text-gray-500 truncate">未読メッセージ</dt>
                      <dd className="text-2xl font-bold text-gray-900">2</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 2h11l4 4v5.5" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-base font-medium text-gray-500 truncate">応募案件</dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        <span className="text-sm text-blue-600">対応中: 1</span>
                        <span className="block text-sm text-gray-500">成約済: 4</span>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* 最近の活動 */}
            <div className="bg-white rounded-lg shadow-sm mb-8">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">最近の活動</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base text-gray-500">
                        <span className="font-semibold text-gray-900">新しいニーズを投稿しました</span>
                        <span className="block mt-1">「自宅サウナを設置したい」</span>
                      </p>
                      <p className="text-sm text-gray-400">2時間前</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base text-gray-500">
                        <span className="font-semibold text-gray-900">新しい提案を受け取りました</span>
                        <span className="block mt-1">「プログラミング教室の開催について」</span>
                      </p>
                      <p className="text-sm text-gray-400">1日前</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base text-gray-500">
                        <span className="font-semibold text-gray-900">取引が完了しました</span>
                        <span className="block mt-1">「地域イベント企画の相談」</span>
                      </p>
                      <p className="text-sm text-gray-400">3日前</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Link 
                    href="/me/transactions" 
                    className="text-base font-medium text-blue-600 hover:text-blue-500"
                  >
                    すべての取引を表示 →
                  </Link>
                </div>
              </div>
            </div>

            {/* クイックアクション */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
                <h3 className="text-lg font-semibold mb-3">新しいニーズを投稿</h3>
                <p className="text-blue-100 mb-4 text-base">あなたの「こんなものが欲しい」を投稿してみましょう</p>
                <Link 
                  href="/needs/new" 
                  className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-base"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  ニーズを投稿
                </Link>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white">
                <h3 className="text-lg font-semibold mb-3">ニーズを探す</h3>
                <p className="text-green-100 mb-4 text-base">他の人のニーズに提案してマッチングしませんか？</p>
                <Link 
                  href="/needs" 
                  className="inline-flex items-center px-4 py-2 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors text-base"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  ニーズを探す
                </Link>
              </div>
            </div>

            {/* お知らせ・サポート */}
            <div className="bg-yellow-50 rounded-lg shadow-sm p-6 border border-yellow-200">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-lg font-medium text-yellow-800">ご利用ガイド</h3>
                  <p className="text-base text-yellow-700 mt-1">
                    NeedPortの使い方がわからない場合は、ガイドをご確認ください。
                  </p>
                  <div className="mt-4 flex space-x-4">
                    <Link 
                      href="/guide" 
                      className="text-base font-medium text-yellow-800 hover:text-yellow-900 underline"
                    >
                      サービス航海図を見る
                    </Link>
                    <Link 
                      href="/faq" 
                      className="text-base font-medium text-yellow-800 hover:text-yellow-900 underline"
                    >
                      よくある質問
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}