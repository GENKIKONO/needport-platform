import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getNeed } from '@/lib/admin/store';
import { getFlags } from '@/lib/admin/flags';
import { SupportMeter } from '@/components/needs/SupportMeter';
import Actions from './Actions';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const need = await getNeed(params.id);
  
  if (!need || !need.isPublished) {
    return {
      title: 'ニーズが見つかりません | NeedPort',
    };
  }

  return {
    title: `${need.title} | NeedPort`,
    description: need.body?.slice(0, 160) || 'NeedPortでニーズを実現しましょう',
    twitter: { 
      card: "summary_large_image" 
    },
    openGraph: { 
      images: [{ url: `/needs/${params.id}/opengraph-image` }] 
    },
  };
}

export default async function NeedDetailPage({ params }: { params: { id: string } }) {
  const need = await getNeed(params.id);
  const flags = await getFlags();

  if (!need || !need.isPublished) {
    notFound();
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: need.title,
        text: need.body || '',
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      // トースト通知
      window.dispatchEvent(new CustomEvent("toast", { 
        detail: { type: "success", message: "URLをコピーしました" }
      }));
    }
  }

  return (
    <main className="container max-w-4xl py-10 section">
      <div className="mb-4">
        <Link href="/needs" className="text-sm text-blue-600 hover:underline" aria-label="ニーズ一覧に戻る">
          ← 一覧へ戻る
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold">{need.title}</h1>
          <button
            onClick={handleShare}
            className="ml-4 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            aria-label="このページを共有"
          >
            <svg className="h-4 w-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            共有
          </button>
        </div>
        
        {/* SupportMeterをタイトル直下に配置 */}
        <div className="mb-6">
          <SupportMeter current={need.supportsCount ?? 0} goal={10} />
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
          <span>投稿者: {need.ownerMasked}</span>
          <span aria-hidden="true">•</span>
          <span>ステージ: {need.stage}</span>
          <span aria-hidden="true">•</span>
          <span>サポーター: {need.supporters}人</span>
          <span aria-hidden="true">•</span>
          <span>提案: {need.proposals}件</span>
          {need.estimateYen && (
            <>
              <span aria-hidden="true">•</span>
              <span>予算: ¥{need.estimateYen.toLocaleString()}</span>
            </>
          )}
        </div>

        {need.body && (
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{need.body}</p>
          </div>
        )}

        {/* 賛同・お気に入りボタン */}
        <Actions id={need.id} supportsCount={need.supportsCount} flagsRequireAccount={flags.requireAccountForEngagement} />

        <div className="text-xs text-gray-500 mt-6">
          作成日: {new Date(need.createdAt).toLocaleDateString('ja-JP')}
          {need.updatedAt !== need.createdAt && (
            <> • 更新日: {new Date(need.updatedAt).toLocaleDateString('ja-JP')}</>
          )}
        </div>
      </div>
    </main>
  );
}
