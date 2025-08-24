import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface CompletePageProps {
  searchParams: { id?: string };
}

export default function NeedsCompletePage({ searchParams }: CompletePageProps) {
  const needId = searchParams.id || 'need_demo_123';

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-[var(--c-text)] mb-4">投稿完了</h1>
        <p className="text-[var(--c-text-muted)] mb-8">
          ニーズの投稿が完了しました。事業者からの提案をお待ちください。
        </p>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">投稿内容</h2>
          <div className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-gray-700">投稿ID</label>
              <p className="mt-1 text-sm text-gray-900 font-mono">{needId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ステータス</label>
              <p className="mt-1 text-sm text-gray-900">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  募集中
                </span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">公開設定</label>
              <p className="mt-1 text-sm text-gray-900">公開（一般ユーザーに表示）</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href={`/needs/${needId}`}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            投稿内容を確認
          </Link>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/needs"
              className="inline-flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ニーズ一覧に戻る
            </Link>
            <Link
              href="/me"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              マイページへ
            </Link>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">次のステップ</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 事業者からの提案をお待ちください</li>
            <li>• 提案が届いたら内容を比較検討してください</li>
            <li>• 合意したら承認制チャットで詳細を詰めます</li>
            <li>• 進行状況はマイページで確認できます</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
