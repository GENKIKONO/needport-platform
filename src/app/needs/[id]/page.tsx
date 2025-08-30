import { notFound } from 'next/navigation';
import { getNeedById } from '@/lib/server/needsService';
import ProposalButton from '@/components/needs/ProposalButton';
import { UnlockAccessButton } from "@/components/needs/UnlockAccessButton";
import { ContactPanel } from "./ContactPanel";

interface NeedDetailPageProps {
  params: { id: string };
}

export default async function NeedDetailPage({ params }: NeedDetailPageProps) {
  // データを取得
  const need = await getNeedById(params.id);

  if (!need) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 解放済みなら連絡先表示（未解放だと何も出ない） */}
        <ContactPanel needId={params.id} />
        {/* ヘッダー */}
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-4">
            <a href="/needs" className="hover:text-gray-700">ニーズ一覧</a>
            <span className="mx-2">/</span>
            <span>詳細</span>
          </nav>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{need.title}</h1>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {need.category}
            </span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
              {need.area}
            </span>
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
              予算: 未設定
            </span>
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
              ステータス: {need.status === 'active' ? '募集中' : '終了'}
            </span>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 詳細情報 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">詳細</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{need.summary}</p>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-medium mb-3">要件・条件</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• 経験年数3年以上</li>
                  <li>• リモートワーク可能</li>
                  <li>• 月1回の進捗報告</li>
                </ul>
              </div>
            </div>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* アクションボタン */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium mb-4">アクション</h3>
              
              {need.status === 'active' ? (
                <div className="space-y-3">
                  <ProposalButton needId={need.id} needTitle={need.title} />
                  {/* 業者向け：閲覧解放（単発決済） */}
                  <UnlockAccessButton needId={need.id} />
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  このニーズは終了しています
                </p>
              )}
            </div>

            {/* 投稿者情報 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium mb-4">投稿者</h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">A</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">匿名ユーザー</p>
                  <p className="text-sm text-gray-500">投稿日: {need.created_at}</p>
                </div>
              </div>
            </div>

            {/* 関連情報 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium mb-4">関連情報</h3>
              <div className="space-y-3">
                <a href="/needs" className="block text-blue-600 hover:text-blue-800">
                  他のニーズを見る
                </a>
                <a href="/service-overview" className="block text-blue-600 hover:text-blue-800">
                  サービス概要
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
