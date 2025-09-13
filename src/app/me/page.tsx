import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MyPageTabs } from "@/components/me/MyPageTabs";

export default async function MePage(){
  const { userId } = auth();
  const user = await currentUser();

  if (!userId) {
    redirect("/sign-in?redirect_url=/me");
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/20 via-slate-50 to-blue-50/30">
      {/* ヘッダー */}
      <div className="bg-white/95 backdrop-blur border-b border-blue-100/50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/90 to-blue-600/90 flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">マイページ</h1>
                <p className="text-lg text-slate-600 mt-1">こんにちは、{user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'ユーザー'}さん</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto">
        <MyPageTabs>
          {/* Overview Tab Content */}
          
          {/* ダッシュボード概要 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/90 rounded-2xl shadow-sm p-6 border border-blue-50/50">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-base font-medium text-slate-500 truncate">進行中の取引</dt>
                    <dd className="text-2xl font-bold text-slate-900">3</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white/90 rounded-2xl shadow-sm p-6 border border-blue-50/50">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-base font-medium text-slate-500 truncate">投稿したニーズ</dt>
                    <dd className="text-2xl font-bold text-slate-900">
                      <span className="text-sm text-green-600">アクティブ: 2</span>
                      <span className="block text-sm text-slate-500">完了: 3</span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white/90 rounded-2xl shadow-sm p-6 border border-blue-50/50">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-base font-medium text-slate-500 truncate">未読メッセージ</dt>
                    <dd className="text-2xl font-bold text-slate-900">2</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white/90 rounded-2xl shadow-sm p-6 border border-blue-50/50">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 2h11l4 4v5.5" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-base font-medium text-slate-500 truncate">応募案件</dt>
                    <dd className="text-2xl font-bold text-slate-900">
                      <span className="text-sm text-blue-600">対応中: 1</span>
                      <span className="block text-sm text-slate-500">成約済: 4</span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* 最近の活動 */}
          <div className="bg-white/90 rounded-2xl shadow-sm mb-8 border border-blue-50/50">
            <div className="px-6 py-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-6">最近の活動</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base text-slate-600">
                      <span className="font-semibold text-slate-900">新しいニーズを投稿しました</span>
                      <span className="block mt-1">「自宅サウナを設置したい」</span>
                    </p>
                    <p className="text-sm text-slate-400">2時間前</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base text-slate-600">
                      <span className="font-semibold text-slate-900">新しい提案を受け取りました</span>
                      <span className="block mt-1">「プログラミング教室の開催について」</span>
                    </p>
                    <p className="text-sm text-slate-400">1日前</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base text-slate-600">
                      <span className="font-semibold text-slate-900">取引が完了しました</span>
                      <span className="block mt-1">「地域イベント企画の相談」</span>
                    </p>
                    <p className="text-sm text-slate-400">3日前</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Link 
                  href="/me/transactions" 
                  className="text-base font-medium text-blue-600 hover:text-blue-700"
                >
                  すべての取引を表示 →
                </Link>
              </div>
            </div>
          </div>

          {/* クイックアクション */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-blue-500/90 to-blue-600/90 rounded-2xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-semibold mb-3">新しいニーズを投稿</h3>
              <p className="text-blue-100 mb-4 text-base">あなたの「こんなものが欲しい」を投稿してみましょう</p>
              <Link 
                href="/needs/new" 
                className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-base"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                ニーズを投稿
              </Link>
            </div>

            <div className="bg-gradient-to-r from-green-500/90 to-green-600/90 rounded-2xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-semibold mb-3">ニーズを探す</h3>
              <p className="text-green-100 mb-4 text-base">他の人のニーズに提案してマッチングしませんか？</p>
              <Link 
                href="/needs" 
                className="inline-flex items-center px-4 py-2 bg-white text-green-600 rounded-xl font-semibold hover:bg-green-50 transition-colors text-base"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                ニーズを探す
              </Link>
            </div>
          </div>

        </MyPageTabs>
      </div>
    </div>
  );
}