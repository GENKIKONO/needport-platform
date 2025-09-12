import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";

const mockPayments = [
  {
    id: 1,
    transactionTitle: "自宅サウナの設置相談",
    amount: "¥15,000",
    type: "着手金",
    status: "支払い済み",
    statusColor: "bg-green-100 text-green-800",
    date: "2025-01-10",
    receiptUrl: "/receipts/payment-1.pdf"
  },
  {
    id: 2,
    transactionTitle: "プログラミング教室の企画",
    amount: "¥8,000",
    type: "着手金",
    status: "支払い済み",
    statusColor: "bg-green-100 text-green-800",
    date: "2025-01-08",
    receiptUrl: "/receipts/payment-2.pdf"
  },
  {
    id: 3,
    transactionTitle: "地域イベント企画の相談",
    amount: "¥5,000",
    type: "着手金",
    status: "支払い済み",
    statusColor: "bg-green-100 text-green-800",
    date: "2024-12-20",
    receiptUrl: "/receipts/payment-3.pdf"
  },
  {
    id: 4,
    transactionTitle: "ホームページ制作依頼",
    amount: "¥12,000",
    type: "着手金",
    status: "返金済み",
    statusColor: "bg-gray-100 text-gray-800",
    date: "2024-12-15",
    receiptUrl: null
  }
];

export default async function PaymentsPage() {
  const { userId } = auth();
  const user = await currentUser();

  if (!userId) {
    return <div>ログインが必要です</div>;
  }

  const totalPaid = mockPayments
    .filter(payment => payment.status === "支払い済み")
    .reduce((sum, payment) => sum + parseInt(payment.amount.replace(/[¥,]/g, "")), 0);

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
                <h1 className="text-2xl font-bold text-gray-900">決済・領収書管理</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 決済サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">総支払額</dt>
                  <dd className="text-lg font-medium text-gray-900">¥{totalPaid.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">支払い回数</dt>
                  <dd className="text-lg font-medium text-gray-900">{mockPayments.filter(p => p.status === "支払い済み").length}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">利用可能領収書</dt>
                  <dd className="text-lg font-medium text-gray-900">{mockPayments.filter(p => p.receiptUrl).length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* 支払い履歴 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">支払い履歴</h3>
            <div className="space-y-4">
              {mockPayments.map((payment) => (
                <div key={payment.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{payment.transactionTitle}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${payment.statusColor}`}>
                          {payment.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <span>金額：{payment.amount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-1.414 0l-7-7A1.997 1.997 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span>種別：{payment.type}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z" />
                            </svg>
                            <span>支払日：{payment.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 lg:mt-0 lg:ml-6">
                      {payment.receiptUrl ? (
                        <a
                          href={payment.receiptUrl}
                          download
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                          </svg>
                          領収書ダウンロード
                        </a>
                      ) : (
                        <span className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-500 rounded-md text-sm font-medium cursor-not-allowed">
                          領収書なし
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 返金・キャンセルポリシー */}
        <div className="bg-white rounded-lg shadow-sm mt-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">返金・キャンセルポリシー</h3>
            <div className="prose text-gray-600">
              <ul className="space-y-2">
                <li className="text-base">• 着手金の返金は原則として承っておりません</li>
                <li className="text-base">• 事業者側の都合による取引キャンセルの場合のみ、全額返金いたします</li>
                <li className="text-base">• 返金処理には5-10営業日お時間をいただく場合があります</li>
                <li className="text-base">• 特例クーポンの発行については、個別にお問い合わせください</li>
              </ul>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-base">
                  ⚠️ 領収書は「NeedPortサービス利用料」として発行されます。<br />
                  詳細については <Link href="/terms" className="text-blue-600 underline hover:text-blue-800">利用規約</Link> をご確認ください。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}