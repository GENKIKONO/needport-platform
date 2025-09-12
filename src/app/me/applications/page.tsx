import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";

const mockApplications = [
  {
    id: 1,
    needTitle: "地域の特産品を使った新商品開発",
    company: "高知フーズ株式会社",
    applicationDate: "2025-01-12",
    status: "審査中",
    statusColor: "bg-yellow-100 text-yellow-800",
    amount: "¥200,000",
    description: "地元の柚子を使った新しい加工食品の企画提案"
  },
  {
    id: 2,
    needTitle: "オンライン英会話サービスの立ち上げ",
    company: "エデュケーションテック合同会社",
    applicationDate: "2025-01-10",
    status: "採用",
    statusColor: "bg-green-100 text-green-800",
    amount: "¥150,000",
    description: "高知県内の子供向けオンライン英会話プラットフォーム構築"
  },
  {
    id: 3,
    needTitle: "農業用IoTセンサーの開発",
    company: "四万十テクノロジー株式会社",
    applicationDate: "2025-01-08",
    status: "不採用",
    statusColor: "bg-red-100 text-red-800",
    amount: "¥300,000",
    description: "スマート農業に向けた土壌監視システムの提案"
  },
  {
    id: 4,
    needTitle: "観光アプリの企画・開発",
    company: "高知観光デジタル株式会社",
    applicationDate: "2025-01-05",
    status: "進行中",
    statusColor: "bg-blue-100 text-blue-800",
    amount: "¥250,000",
    description: "外国人観光客向けの多言語対応観光ガイドアプリ"
  }
];

export default async function ApplicationsPage() {
  const { userId } = auth();
  const user = await currentUser();

  if (!userId) {
    return <div>ログインが必要です</div>;
  }

  const pendingApplications = mockApplications.filter(app => app.status === "審査中");
  const acceptedApplications = mockApplications.filter(app => app.status === "採用" || app.status === "進行中");
  const rejectedApplications = mockApplications.filter(app => app.status === "不採用");

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
                <h1 className="text-2xl font-bold text-gray-900">応募案件管理</h1>
              </div>
              <Link
                href="/needs"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-base font-medium hover:bg-blue-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                ニーズを探す
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 応募サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">総応募数</dt>
                  <dd className="text-xl font-semibold text-gray-900">{mockApplications.length}</dd>
                </dl>
              </div>
            </div>
          </div>

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
                  <dt className="text-sm font-medium text-gray-500 truncate">審査中</dt>
                  <dd className="text-xl font-semibold text-gray-900">{pendingApplications.length}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">採用</dt>
                  <dd className="text-xl font-semibold text-gray-900">{acceptedApplications.length}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">不採用</dt>
                  <dd className="text-xl font-semibold text-gray-900">{rejectedApplications.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-base font-medium">
              すべて
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-base hover:bg-gray-200 hover:text-gray-900">
              審査中
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-base hover:bg-gray-200 hover:text-gray-900">
              採用
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-base hover:bg-gray-200 hover:text-gray-900">
              進行中
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-base hover:bg-gray-200 hover:text-gray-900">
              不採用
            </button>
          </div>
        </div>

        {/* 応募一覧 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              {mockApplications.map((application) => (
                <div key={application.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">{application.needTitle}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${application.statusColor}`}>
                          {application.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-base text-gray-600 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span>応募先：{application.company}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <span>提案金額：{application.amount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z" />
                            </svg>
                            <span>応募日：{application.applicationDate}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-base text-gray-700 bg-gray-50 p-3 rounded-md">
                        {application.description}
                      </p>
                    </div>
                    <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col gap-2">
                      <Link
                        href={`/needs/${application.id}`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-base font-medium text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        詳細を見る
                      </Link>
                      {(application.status === "採用" || application.status === "進行中") && (
                        <Link
                          href={`/me/messages/${application.id}`}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 rounded-md text-base font-medium text-white hover:bg-blue-700"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          メッセージ
                        </Link>
                      )}
                      {application.status === "進行中" && (
                        <Link
                          href={`/me/transactions/${application.id}`}
                          className="inline-flex items-center px-4 py-2 bg-green-600 rounded-md text-base font-medium text-white hover:bg-green-700"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          取引管理
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 応募のコツ */}
        <div className="bg-white rounded-lg shadow-sm mt-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">応募を成功させるコツ</h3>
            <div className="prose text-gray-600">
              <ul className="space-y-3">
                <li className="text-base">• <strong>具体的な提案をする：</strong> 抽象的な内容ではなく、具体的な実現方法や工程を示しましょう</li>
                <li className="text-base">• <strong>実績をアピール：</strong> 類似案件の経験や成果物がある場合は積極的に紹介しましょう</li>
                <li className="text-base">• <strong>適正な価格設定：</strong> 市場価格を調査し、妥当性のある金額を提案しましょう</li>
                <li className="text-base">• <strong>レスポンスを早く：</strong> 迅速な返答は信頼関係の構築につながります</li>
                <li className="text-base">• <strong>質問を活用する：</strong> 不明な点は遠慮なく質問し、理解を深めましょう</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 空の状態 */}
        {mockApplications.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">応募履歴がありません</h3>
            <p className="text-base text-gray-600 mb-4">興味のあるニーズに応募して、事業機会を広げましょう。</p>
            <Link
              href="/needs"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md hover:bg-blue-700"
            >
              ニーズを探す
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}