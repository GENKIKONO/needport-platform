import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";

const mockTransactions = [
  {
    id: 1,
    title: "自宅サウナの設置相談",
    partner: "サウナ工房株式会社",
    status: "交渉中",
    statusColor: "bg-yellow-100 text-yellow-800",
    amount: "¥150,000",
    date: "2025-01-10",
    lastUpdate: "2時間前"
  },
  {
    id: 2,
    title: "プログラミング教室の企画",
    partner: "テックラーニング合同会社",
    status: "成約",
    statusColor: "bg-green-100 text-green-800",
    amount: "¥80,000",
    date: "2025-01-08",
    lastUpdate: "1日前"
  },
  {
    id: 3,
    title: "地域イベント企画の相談",
    partner: "イベントプランニング田中",
    status: "完了",
    statusColor: "bg-gray-100 text-gray-800",
    amount: "¥50,000",
    date: "2024-12-20",
    lastUpdate: "3週間前"
  },
  {
    id: 4,
    title: "ホームページ制作依頼",
    partner: "Webデザイン山田",
    status: "キャンセル",
    statusColor: "bg-red-100 text-red-800",
    amount: "¥120,000",
    date: "2024-12-15",
    lastUpdate: "4週間前"
  }
];

export default async function TransactionsPage() {
  const { userId } = auth();
  const user = await currentUser();

  if (!userId) {
    return <div>ログインが必要です</div>;
  }

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
                <h1 className="text-2xl font-bold text-gray-900">取引管理</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-base font-medium">
              すべて
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-base hover:bg-gray-200 hover:text-gray-900">
              交渉中
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-base hover:bg-gray-200 hover:text-gray-900">
              成約
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-base hover:bg-gray-200 hover:text-gray-900">
              完了
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-base hover:bg-gray-200 hover:text-gray-900">
              キャンセル
            </button>
          </div>
        </div>

        {/* 取引一覧 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              {mockTransactions.map((transaction) => (
                <div key={transaction.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{transaction.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.statusColor}`}>
                          {transaction.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span>相手：{transaction.partner}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <span>金額：{transaction.amount}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z" />
                            </svg>
                            <span>開始日：{transaction.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>最終更新：{transaction.lastUpdate}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col lg:flex-row gap-2">
                      <Link
                        href={`/me/transactions/${transaction.id}`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        詳細を見る
                      </Link>
                      {transaction.status === "交渉中" && (
                        <Link
                          href={`/me/messages/${transaction.id}`}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700"
                        >
                          メッセージ
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 空の状態 */}
        {mockTransactions.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">取引がありません</h3>
            <p className="text-gray-500 mb-4">ニーズを投稿して、事業者からの提案を受け取りましょう。</p>
            <Link
              href="/needs/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              ニーズを投稿する
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}