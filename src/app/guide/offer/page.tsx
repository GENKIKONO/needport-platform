import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '提案フロー | NeedPort',
  description: 'NeedPortでの提案・見積の流れをご紹介します。',
};

const steps = [
  {
    id: 1,
    title: '企業登録',
    description: 'まずはNeedPortに事業者として登録します。基本情報とサービス内容を登録してください。',
    icon: (
      <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  {
    id: 2,
    title: '案件検索',
    description: 'ニーズ一覧から、あなたのサービスに合う案件を探します。地域やカテゴリで絞り込みも可能です。',
    icon: (
      <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )
  },
  {
    id: 3,
    title: '提案作成',
    description: '案件の詳細を確認し、あなたのサービスでどのように解決できるかを提案書にまとめます。',
    icon: (
      <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    id: 4,
    title: '見積作成',
    description: '提案内容に基づいて、具体的な見積もりを作成します。料金体系やスケジュールを明確に示しましょう。',
    icon: (
      <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    )
  },
  {
    id: 5,
    title: 'メッセージ送信',
    description: '提案書と見積もりを添付して、ニーズ投稿者にメッセージを送信します。',
    icon: (
      <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  },
  {
    id: 6,
    title: '成立・契約',
    description: '提案が採用されると、NeedPortを通じて契約を締結し、プロジェクトが開始されます。',
    icon: (
      <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
];

const faqs = [
  {
    id: 1,
    question: '事業者登録は無料ですか？',
    answer: 'はい、NeedPortへの事業者登録は完全無料です。'
  },
  {
    id: 2,
    question: '提案の際に手数料はかかりますか？',
    answer: '提案自体は無料です。プロジェクトが成立した場合のみ、NeedPortの手数料が発生します。'
  },
  {
    id: 3,
    question: '信頼バッジとは何ですか？',
    answer: '信頼バッジは、過去の実績や評価に基づいて付与される信頼性の指標です。高い信頼バッジを持つ事業者の提案は優先的に表示されます。'
  },
  {
    id: 4,
    question: '提案の数に制限はありますか？',
    answer: '提案の数に制限はありません。ただし、質の高い提案を心がけてください。'
  }
];

export default function OfferGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">提案フロー</h1>
        <p className="text-lg text-gray-600">
          NeedPortでの提案・見積の流れをご紹介します。あなたのサービスで地域のニーズに応えましょう。
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">提案の流れ</h2>
            
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
                      {step.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      ステップ {step.id}: {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* サイドバー */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">よくある質問</h3>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details key={faq.id} className="group">
                  <summary className="cursor-pointer text-sm font-medium text-gray-900 hover:text-blue-600">
                    {faq.question}
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
