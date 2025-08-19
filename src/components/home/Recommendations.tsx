'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface RecommendationsProps {
  audienceId?: string;
}

const recommendationsData = {
  general: [
    {
      id: 1,
      title: '地域の高齢者向け配食サービス',
      description: '一人暮らしの高齢者が安心して食事できる、温かく栄養バランスの良い配食サービスが欲しいです。',
      supportsCount: 15,
      stage: '募集',
      href: '/needs/1'
    },
    {
      id: 2,
      title: '子育て世代のための一時預かり',
      description: '急な用事やリフレッシュの時間を確保したい子育て世代のための、安心できる一時預かりサービスを探しています。',
      supportsCount: 8,
      stage: '募集',
      href: '/needs/2'
    },
    {
      id: 3,
      title: '地域密着型の移動販売',
      description: '高知の特産品を使った移動販売で、地域の魅力を発信したい。',
      supportsCount: 12,
      stage: '出港',
      href: '/needs/3'
    }
  ],
  business: [
    {
      id: 4,
      title: '事業者登録のご案内',
      description: 'NeedPortでサービスを提供する事業者として登録しませんか？',
      supportsCount: 0,
      stage: '情報',
      href: '/vendor/register'
    },
    {
      id: 5,
      title: '高知県の企業支援制度',
      description: '高知県の企業支援制度や補助金について詳しく知りたい方はこちら。',
      supportsCount: 0,
      stage: '情報',
      href: '/guide'
    }
  ],
  government: [
    {
      id: 6,
      title: '自治体向けサポート',
      description: '地域の課題解決をサポートするNeedPortの自治体向けサービスについて。',
      supportsCount: 0,
      stage: '情報',
      href: '/guide'
    }
  ],
  supporter: [
    {
      id: 7,
      title: 'サポーター活動のご案内',
      description: 'NeedPortのプロジェクトを支援する方法について詳しくご説明します。',
      supportsCount: 0,
      stage: '情報',
      href: '/guide'
    }
  ]
};

export default function Recommendations({ audienceId = 'general' }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState(recommendationsData.general);

  useEffect(() => {
    setRecommendations(recommendationsData[audienceId as keyof typeof recommendationsData] || recommendationsData.general);
  }, [audienceId]);

  return (
    <section className="mx-auto max-w-6xl px-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">おすすめコンテンツ</h2>
        <p className="text-gray-600">あなたに最適なコンテンツをご紹介します</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.stage === '募集' ? 'bg-blue-100 text-blue-800' :
                item.stage === '出港' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {item.stage}
              </span>
              {item.supportsCount > 0 && (
                <span className="text-sm text-gray-500">
                  賛同 {item.supportsCount}人
                </span>
              )}
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {item.title}
            </h3>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {item.description}
            </p>
            
            <Link
              href={item.href}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              詳細を見る
              <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
