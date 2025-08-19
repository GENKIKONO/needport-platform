'use client';

import Link from 'next/link';

const supportServices = [
  {
    id: 'posting',
    title: 'はじめての投稿を、かんたんに。',
    description: 'テンプレと事例で迷わず公開まで。',
    cta: '投稿のコツを見る',
    href: '/guide/posting',
    color: 'bg-green-50 border-green-200',
    icon: (
      <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    )
  },
  {
    id: 'offer',
    title: '見つけて、提案して、つながる。',
    description: '登録→検索→提案→見積の流れを解説。',
    cta: '提案フローを見る',
    href: '/guide/offer',
    color: 'bg-orange-50 border-orange-200',
    icon: (
      <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  {
    id: 'consultation',
    title: '使い方・安全・トラブル、お気軽に。',
    description: 'フォームからご相談ください。',
    cta: '相談する',
    href: '/support',
    color: 'bg-blue-50 border-blue-200',
    icon: (
      <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
];

export default function SupportServices() {
  const handleCardClick = (serviceId: string) => {
    // 計測イベント
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'support_card_clicked', {
        id: serviceId
      });
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">NeedPort支援サービス</h2>
        <p className="text-lg text-gray-600">あなたのニーズ実現をサポートします</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {supportServices.map((service) => (
          <div
            key={service.id}
            className={`rounded-xl border-2 p-6 transition-all hover:shadow-lg ${service.color}`}
          >
            <div className="flex items-center mb-4">
              <div className="mr-3">
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{service.title}</h3>
            </div>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              {service.description}
            </p>
            
            <Link
              href={service.href}
              onClick={() => handleCardClick(service.id)}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {service.cta}
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
