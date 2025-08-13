import { Suspense } from 'react';
import Link from 'next/link';
import { getRoom, getSummaries, getAdoptedOffer, getNeed } from '@/lib/mock/api';
import { piiMask } from '@/lib/ui/pii';
import { formatDateTime, formatCurrency } from '@/lib/ui/format';
import { config } from '@/lib/config';
import SummaryPanel from '@/components/SummaryPanel';

// ローディングスケルトン
function RoomSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="h-8 bg-gray-200 rounded mb-4 animate-pulse"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="h-64 bg-gray-200 rounded mb-4 animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

// メインコンテンツ
async function RoomDetail({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [room, summaries, adoptedOffer, need] = await Promise.all([
      getRoom(id),
      getSummaries(id),
      getAdoptedOffer(id),
      getNeed(id)
    ]);

    if (!room) {
      throw new Error('ルームが見つかりません');
    }

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4 inline-block"
          >
            ← 一覧に戻る
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            協議ルーム
          </h1>
          
          {need && (
            <p className="text-gray-600">
              {need.title}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-6">
            {/* 成立条件パネル */}
            {adoptedOffer && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">成立条件</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">最低人数</div>
                    <div className="text-lg font-semibold">{adoptedOffer.min_people}名</div>
                  </div>
                  {adoptedOffer.max_people && (
                    <div>
                      <div className="text-sm text-gray-600">最大人数</div>
                      <div className="text-lg font-semibold">{adoptedOffer.max_people}名</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-600">締切</div>
                    <div className="text-lg font-semibold">{formatDateTime(adoptedOffer.deadline)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">価格</div>
                    <div className="text-lg font-semibold">
                      {typeof adoptedOffer.price_value === 'number' 
                        ? formatCurrency(adoptedOffer.price_value)
                        : `${formatCurrency(adoptedOffer.price_value.min)} - ${formatCurrency(adoptedOffer.price_value.max)}`
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* メッセージタイムライン */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">メッセージ</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {room.messages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {message.sender.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{message.sender}</span>
                        <span className="text-sm text-gray-500">
                          {formatDateTime(message.ts)}
                        </span>
                      </div>
                      <div className="text-gray-700 bg-gray-50 rounded-lg p-3">
                        {config.ENABLE_PII_MASK ? piiMask(message.body) : message.body}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* メッセージ入力欄 */}
              <div className="mt-6">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="メッセージを入力..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      // PIIマスクのプレビュー
                      if (config.ENABLE_PII_MASK) {
                        const masked = piiMask(e.target.value);
                        if (config.DEBUG_MODE) {
                          console.log('PII masked preview:', masked);
                        }
                      }
                    }}
                  />
                  <button 
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors min-h-[44px]"
                    onClick={() => console.log('room_message_sent')}
                  >
                    送信
                  </button>
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">アクション</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => console.log('summary_proposed')}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors min-h-[44px]"
                >
                  サマリー提案
                </button>
                <button
                  onClick={() => console.log('summary_approved')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors min-h-[44px]"
                >
                  サマリー承認
                </button>
              </div>
            </div>
          </div>

          {/* サイドバー */}
          <div>
            <SummaryPanel summaries={summaries} />
          </div>
        </div>
      </div>
    );
  } catch {
    throw new Error('ルームの取得に失敗しました');
  }
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<RoomSkeleton />}>
      <RoomDetail params={params} />
    </Suspense>
  );
}
