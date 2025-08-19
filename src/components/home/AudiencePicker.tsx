'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const audienceTypes = [
  {
    id: 'consumer',
    label: '生活者の方',
    description: 'ニーズを探して賛同する',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    color: 'bg-blue-50 border-blue-200 text-blue-700'
  },
  {
    id: 'vendor',
    label: '事業者の方',
    description: 'サービスを提供する',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    color: 'bg-green-50 border-green-200 text-green-700'
  },
  {
    id: 'gov',
    label: '自治体の方',
    description: '地域の課題を解決する',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
    color: 'bg-purple-50 border-purple-200 text-purple-700'
  },
  {
    id: 'ally',
    label: '支援者の方',
    description: 'プロジェクトを支援する',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    color: 'bg-orange-50 border-orange-200 text-orange-700'
  }
];

const recommendationsData = {
  consumer: [
    {
      id: 1,
      title: '地域の高齢者向け配食サービス',
      description: '一人暮らしの高齢者が安心して食事できる、温かく栄養バランスの良い配食サービスが欲しいです。',
      supportsCount: 15,
      href: '/needs/1'
    },
    {
      id: 2,
      title: '子育て世代のための一時預かり',
      description: '急な用事やリフレッシュの時間を確保したい子育て世代のための、安心できる一時預かりサービスを探しています。',
      supportsCount: 8,
      href: '/needs/2'
    }
  ],
  vendor: [
    {
      id: 3,
      title: '事業者登録のご案内',
      description: 'NeedPortでサービスを提供する事業者として登録しませんか？',
      href: '/vendor/register'
    },
    {
      id: 4,
      title: '高知県の企業支援制度',
      description: '高知県の企業支援制度や補助金について詳しく知りたい方はこちら。',
      href: '/guide'
    }
  ],
  gov: [
    {
      id: 5,
      title: '自治体向けサポート',
      description: '地域の課題解決をサポートするNeedPortの自治体向けサービスについて。',
      href: '/guide'
    }
  ],
  ally: [
    {
      id: 6,
      title: 'サポーター活動のご案内',
      description: 'NeedPortのプロジェクトを支援する方法について詳しくご説明します。',
      href: '/guide'
    }
  ]
};

export default function AudiencePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedAudience, setSelectedAudience] = useState('consumer');

  useEffect(() => {
    const audience = searchParams.get('audience') as keyof typeof recommendationsData;
    if (audience && recommendationsData[audience]) {
      setSelectedAudience(audience);
    }
  }, [searchParams]);

  const handleSelection = (audienceId: string) => {
    setSelectedAudience(audienceId);
    const params = new URLSearchParams(searchParams);
    params.set('audience', audienceId);
    router.replace(`/?${params.toString()}`, { scroll: false });
    
    // 計測イベント
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'audience_changed', {
        audience: audienceId
      });
    }
  };

  const currentRecommendations = recommendationsData[selectedAudience as keyof typeof recommendationsData] || recommendationsData.consumer;

  return (
    <section className="mx-auto max-w-6xl px-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">あなたはどちらですか？</h2>
        <p className="text-gray-600">対象に応じたおすすめコンテンツをご案内します</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {audienceTypes.map((audience) => (
          <button
            key={audience.id}
            onClick={() => handleSelection(audience.id)}
            className={`p-6 rounded-xl border-2 transition-all hover:shadow-md ${
              selectedAudience === audience.id
                ? `${audience.color} shadow-md`
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="mb-3 flex justify-center" aria-hidden="true">
                {audience.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{audience.label}</h3>
              <p className="text-sm text-gray-600">{audience.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* 推奨コンテンツ */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">おすすめコンテンツ</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {currentRecommendations.map((item) => (
            <div key={item.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <h4 className="font-medium text-gray-900 mb-2">{item.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              {item.supportsCount && (
                <p className="text-xs text-gray-500 mb-2">賛同 {item.supportsCount}人</p>
              )}
              <a
                href={item.href}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                詳細を見る →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
