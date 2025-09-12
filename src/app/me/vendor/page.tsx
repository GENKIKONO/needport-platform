import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";

const mockVendorData = {
  companyName: "高知テクノロジーソリューションズ",
  representative: "田中 太郎",
  location: "高知市",
  businessType: "IT・デジタル",
  description: "地域に根ざしたITソリューション提供を行っています。Web開発からシステム構築まで幅広く対応。",
  isApproved: true,
  registrationDate: "2024-11-15"
};

const mockProposals = [
  {
    id: 1,
    needTitle: "ホームページ制作について",
    client: "山田商店",
    status: "未対応",
    statusColor: "bg-yellow-100 text-yellow-800",
    amount: "¥120,000",
    proposedDate: "2025-01-10",
    description: "地域密着型の商店向けホームページを制作いたします。"
  },
  {
    id: 2,
    needTitle: "在庫管理システムの導入",
    client: "佐藤工業",
    status: "対応中",
    statusColor: "bg-blue-100 text-blue-800",
    amount: "¥300,000",
    proposedDate: "2025-01-08",
    description: "効率的な在庫管理を実現するシステムを提案します。"
  },
  {
    id: 3,
    needTitle: "ECサイト構築相談",
    client: "高知特産品販売",
    status: "成約",
    statusColor: "bg-green-100 text-green-800",
    amount: "¥450,000",
    proposedDate: "2025-01-05",
    description: "地域特産品の販売に特化したECサイトを構築します。"
  }
];

const mockCompanyPosts = [
  {
    id: 1,
    title: "IT導入支援サービスの提供開始",
    category: "サービス紹介",
    status: "公開",
    statusColor: "bg-green-100 text-green-800",
    views: 45,
    proposals: 3,
    createdAt: "2025-01-12"
  },
  {
    id: 2,
    title: "Web制作の無料相談会開催",
    category: "イベント",
    status: "公開",
    statusColor: "bg-green-100 text-green-800",
    views: 28,
    proposals: 5,
    createdAt: "2025-01-10"
  }
];

export default async function VendorDashboardPage() {
  const { userId } = auth();
  const user = await currentUser();

  if (!userId) {
    return <div>ログインが必要です</div>;
  }

  const pendingProposals = mockProposals.filter(p => p.status === "未対応");
  const activeProposals = mockProposals.filter(p => p.status === "対応中");
  const completedProposals = mockProposals.filter(p => p.status === "成約");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/me" className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">事業者ダッシュボード</h1>
                  <p className="text-sm text-gray-600">{mockVendorData.companyName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {mockVendorData.isApproved ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    承認済み
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    審査中
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* サイドナビ */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-sm p-4 space-y-2">
              <Link href="/me/vendor" className="flex items-center gap-3 px-3 py-2 text-white bg-blue-600 rounded-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                ダッシュボード
              </Link>
              <Link href="/me/vendor/proposals" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                提案管理
              </Link>
              <Link href="/me/vendor/posts" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                自社ニーズ管理
              </Link>
              <Link href="/me/vendor/messages" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                メッセージ
              </Link>
              <Link href="/me/vendor/profile" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                企業プロフィール
              </Link>
              <Link href="/me/vendor/guide" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                提案ガイド
              </Link>
            </nav>
          </div>

          {/* メインコンテンツ */}
          <div className="lg:col-span-3">
            {/* 統計概要 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">未対応提案</dt>
                      <dd className="text-lg font-medium text-gray-900">{pendingProposals.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">対応中</dt>
                      <dd className="text-lg font-medium text-gray-900">{activeProposals.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">成約済み</dt>
                      <dd className="text-lg font-medium text-gray-900">{completedProposals.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">投稿ニーズ</dt>
                      <dd className="text-lg font-medium text-gray-900">{mockCompanyPosts.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* 最近の提案 */}
            <div className="bg-white rounded-lg shadow-sm mb-8">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">最近の提案</h3>
                  <Link 
                    href="/me/vendor/proposals" 
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    すべて見る →
                  </Link>
                </div>
                <div className="space-y-4">
                  {mockProposals.slice(0, 3).map((proposal) => (
                    <div key={proposal.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-md font-semibold text-gray-900">{proposal.needTitle}</h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${proposal.statusColor}`}>
                              {proposal.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            <span>依頼者：{proposal.client} | 提案金額：{proposal.amount}</span>
                          </div>
                          <p className="text-sm text-gray-700">{proposal.description}</p>
                        </div>
                        <div className="mt-2 sm:mt-0 sm:ml-4">
                          <Link
                            href={`/me/vendor/proposals/${proposal.id}`}
                            className="inline-flex items-center px-3 py-2 text-base font-medium text-blue-600 hover:text-blue-700"
                          >
                            詳細
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 自社投稿ニーズ */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">自社投稿ニーズ</h3>
                  <div className="flex items-center gap-2">
                    <Link 
                      href="/me/vendor/posts" 
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      すべて見る →
                    </Link>
                    <Link
                      href="/needs/new"
                      className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                    >
                      新規投稿
                    </Link>
                  </div>
                </div>
                <div className="space-y-4">
                  {mockCompanyPosts.map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-md font-semibold text-gray-900">{post.title}</h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${post.statusColor}`}>
                              {post.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span>{post.category} | 閲覧数：{post.views} | 提案数：{post.proposals} | {post.createdAt}</span>
                          </div>
                        </div>
                        <div className="mt-2 sm:mt-0 sm:ml-4 flex gap-2">
                          <Link
                            href={`/needs/${post.id}`}
                            className="inline-flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
                          >
                            表示
                          </Link>
                          <Link
                            href={`/needs/${post.id}/edit`}
                            className="inline-flex items-center px-3 py-2 text-base font-medium text-blue-600 hover:text-blue-700"
                          >
                            編集
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}