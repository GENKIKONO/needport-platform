import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";

const mockChatThreads = [
  {
    id: 1,
    title: "自宅サウナの設置相談",
    partner: "サウナ工房株式会社",
    lastMessage: "見積もりをお送りいたします。ご確認をお願いします。",
    lastMessageTime: "2時間前",
    unreadCount: 2,
    status: "交渉中",
    avatar: "S"
  },
  {
    id: 2,
    title: "プログラミング教室の企画",
    partner: "テックラーニング合同会社",
    lastMessage: "教材の準備が完了いたしました。",
    lastMessageTime: "5時間前",
    unreadCount: 0,
    status: "成約",
    avatar: "T"
  },
  {
    id: 3,
    title: "地域イベント企画の相談",
    partner: "イベントプランニング田中",
    lastMessage: "ありがとうございました。また機会がございましたら宜しくお願いします。",
    lastMessageTime: "3日前",
    unreadCount: 0,
    status: "完了",
    avatar: "田"
  }
];

export default async function MessagesPage() {
  const { userId } = auth();
  const user = await currentUser();

  if (!userId) {
    return <div>ログインが必要です</div>;
  }

  const totalUnread = mockChatThreads.reduce((sum, thread) => sum + thread.unreadCount, 0);

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
                  <h1 className="text-2xl font-bold text-gray-900">チャット履歴</h1>
                  {totalUnread > 0 && (
                    <p className="text-base text-blue-600 mt-1">{totalUnread}件の未読メッセージがあります</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* チャットスレッド一覧 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">メッセージ一覧</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {mockChatThreads.map((thread) => (
                  <Link key={thread.id} href={`/me/messages/${thread.id}`}>
                    <div className="p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">{thread.avatar}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-base font-semibold text-gray-900 truncate">
                              {thread.partner}
                            </p>
                            {thread.unreadCount > 0 && (
                              <span className="inline-flex items-center justify-center px-2 py-1 text-sm font-bold leading-none text-white bg-blue-600 rounded-full">
                                {thread.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{thread.title}</p>
                          <p className="text-base text-gray-600 truncate">{thread.lastMessage}</p>
                          <p className="text-sm text-gray-400 mt-1">{thread.lastMessageTime}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* チャット詳細プレビュー */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm h-96 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">チャットを選択してください</h3>
                <p className="text-base text-gray-600">左のメッセージ一覧からチャットを選択すると、会話履歴が表示されます。</p>
              </div>
            </div>
          </div>
        </div>

        {/* チャット機能の説明 */}
        <div className="bg-white rounded-lg shadow-sm mt-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">チャット機能について</h3>
            <div className="prose text-gray-600">
              <ul className="space-y-2">
                <li className="text-base">• 案件ごとに事業者と個別のチャットで交渉を進められます</li>
                <li className="text-base">• 成約操作や重要な合意事項は自動的に記録されます</li>
                <li className="text-base">• 取引完了後もメッセージ履歴は保持されます</li>
                <li className="text-base">• 不適切なメッセージを受信した場合は、運営にお知らせください</li>
              </ul>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-base font-semibold text-blue-800">安全な取引のために</h4>
                    <p className="text-base text-blue-700 mt-2">
                      取引に関する重要な合意は、必ずチャット内で文書として残すようにしましょう。<br />
                      口約束ではなく、証跡を残すことでトラブルを防げます。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 空の状態 */}
        {mockChatThreads.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">メッセージがありません</h3>
            <p className="text-base text-gray-600 mb-4">ニーズを投稿すると、事業者からのメッセージが届きます。</p>
            <Link
              href="/needs/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md hover:bg-blue-700"
            >
              ニーズを投稿する
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}