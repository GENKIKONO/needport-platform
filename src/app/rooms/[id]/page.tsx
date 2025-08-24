import { getDevSession } from '@/lib/devAuth';
import { getUserRole } from '@/lib/auth/roles';
import { canViewRoom } from '@/lib/auth/ability';
import { redirect } from 'next/navigation';

interface RoomPageProps {
  params: { id: string };
}

export default async function RoomPage({ params }: RoomPageProps) {
  const session = await getDevSession();
  const role = getUserRole(session);
  
  // モックデータ（実際のAPIから取得）
  const room = {
    id: params.id,
    title: 'Webサイト制作について',
    needId: '1',
    members: [
      { id: '1', name: 'クライアント', role: 'client' },
      { id: '2', name: '開発者', role: 'vendor' },
    ],
    messages: [
      {
        id: '1',
        sender: 'クライアント',
        content: 'こんにちは！Webサイト制作について相談させていただきます。',
        timestamp: '2024-01-15T10:00:00Z',
      },
      {
        id: '2',
        sender: '開発者',
        content: '承知いたしました。どのようなサイトをお考えでしょうか？',
        timestamp: '2024-01-15T10:05:00Z',
      },
    ],
  };

  // 参加者かどうかを判定（モック）
  const isMember = session && room.members.some(m => m.id === session.userId);
  const canSee = canViewRoom(role, isMember);

  if (!canSee) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="mb-6">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                このチャットは参加者のみ閲覧できます
              </h1>
              <p className="text-gray-600 mb-6">
                このチャットルームに参加するには、関連するニーズに応募または提案する必要があります。
              </p>
            </div>

            {role === 'guest' ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  チャットに参加するにはログインが必要です
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href="/auth/login"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    ログイン
                  </a>
                  <a
                    href="/auth/register"
                    className="bg-white hover:bg-gray-50 text-blue-600 font-medium py-3 px-6 rounded-lg border border-blue-600 transition-colors"
                  >
                    新規登録
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  このニーズに応募または提案してチャットに参加しましょう
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={`/needs/${room.needId}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    ニーズ詳細を見る
                  </a>
                  <a
                    href="/needs"
                    className="bg-white hover:bg-gray-50 text-blue-600 font-medium py-3 px-6 rounded-lg border border-blue-600 transition-colors"
                  >
                    他のニーズを探す
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-4">
            <a href="/needs" className="hover:text-gray-700">ニーズ一覧</a>
            <span className="mx-2">/</span>
            <a href={`/needs/${room.needId}`} className="hover:text-gray-700">ニーズ詳細</a>
            <span className="mx-2">/</span>
            <span>チャット</span>
          </nav>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{room.title}</h1>
          <p className="text-gray-600">
            参加者: {room.members.length}人
          </p>
        </div>

        {/* チャットエリア */}
        <div className="bg-white rounded-lg shadow-sm border">
          {/* メッセージ一覧 */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold mb-4">メッセージ</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {room.messages.map((message) => (
                <div key={message.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-gray-600">
                      {message.sender.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{message.sender}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(message.timestamp).toLocaleString('ja-JP')}
                      </span>
                    </div>
                    <p className="text-gray-700">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* メッセージ入力 */}
          <div className="p-6">
            <div className="flex space-x-3">
              <input
                type="text"
                placeholder="メッセージを入力..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                送信
              </button>
            </div>
          </div>
        </div>

        {/* 参加者一覧 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">参加者</h2>
          <div className="space-y-3">
            {room.members.map((member) => (
              <div key={member.id} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-500">
                    {member.role === 'client' ? 'クライアント' : '開発者'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
