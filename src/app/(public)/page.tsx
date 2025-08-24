import Link from 'next/link';
import { HomeIcon, PlusCircleIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';
import HomeServiceSummary from '@/components/home/HomeServiceSummary';

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-6xl font-bold text-[var(--c-text)] mb-4">
          NeedPort
        </h1>
        <p className="text-xl text-[var(--c-text-muted)] mb-8">
          地域のニーズと事業者をつなぐプラットフォーム
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/needs" 
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircleIcon className="w-5 h-5" />
            ニーズを探す
          </Link>
          <Link 
            href="/needs/new" 
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlusCircleIcon className="w-5 h-5" />
            ニーズを投稿
          </Link>
          <Link 
            href="/vendor/register" 
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <BuildingOffice2Icon className="w-5 h-5" />
            事業者登録
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
          <HomeIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">地域のニーズ</h3>
          <p className="text-[var(--c-text-muted)]">
            地域から集まるリアルなニーズを発見し、応援できます
          </p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
          <BuildingOffice2Icon className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">事業者とのマッチング</h3>
          <p className="text-[var(--c-text-muted)]">
            適切な事業者とつながり、ニーズを実現できます
          </p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
          <PlusCircleIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">コミュニティ形成</h3>
          <p className="text-[var(--c-text-muted)]">
            地域の課題解決を通じて、より良いコミュニティを作ります
          </p>
        </div>
      </div>

      {/* サービス航海図要約 */}
      <HomeServiceSummary />

      <div className="text-center mt-12">
        <Link 
          href="/service-overview" 
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          サービスの詳細を見る
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </main>
  );
}


