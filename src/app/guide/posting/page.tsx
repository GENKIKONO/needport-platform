import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '投稿のコツ | NeedPort',
  description: 'NeedPortでのニーズ投稿の流れとコツをご紹介します。',
};

const steps = [
  {
    id: 1,
    title: '下書き作成',
    description: 'まずは思いついたことを自由に書き出してみましょう。完璧を求めず、気軽に始めることが大切です。',
    icon: (
      <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    )
  },
  {
    id: 2,
    title: 'プレビュー確認',
    description: '投稿前にプレビューで見た目を確認。タイトルや説明文が分かりやすく伝わるかチェックしましょう。',
    icon: (
      <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )
  },
  {
    id: 3,
    title: '公開',
    description: 'いよいよ公開！高知県の市町村を選択して、地域に密着したニーズとして投稿します。',
    icon: (
      <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    )
  },
  {
    id: 4,
    title: '紹介コード連携',
    description: '信頼できる人からの紹介コードがあれば、より多くの人にあなたのニーズが届きます。',
    icon: (
      <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    )
  },
  {
    id: 5,
    title: '賛同獲得',
    description: '同じ思いを持つ人たちから賛同が集まります。コメントや提案も受け取れるようになります。',
    icon: (
      <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    )
  },
  {
    id: 6,
    title: '更新・改善',
    description: '賛同者の声を参考に、ニーズの内容を更新・改善していきましょう。',
    icon: (
      <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    )
  }
];

const faqs = [
  {
    id: 1,
    question: '投稿は無料ですか？',
    answer: 'はい、NeedPortでのニーズ投稿は完全無料です。'
  },
  {
    id: 2,
    question: '投稿したニーズは誰でも見えますか？',
    answer: '投稿したニーズは公開され、NeedPortを利用する人全員が閲覧できます。ただし、個人情報は適切に保護されます。'
  },
  {
    id: 3,
    question: '投稿後に内容を変更できますか？',
    answer: 'はい、マイページから投稿したニーズの編集・削除が可能です。'
  },
  {
    id: 4,
    question: '紹介コードは必須ですか？',
    answer: 'いいえ、紹介コードは任意です。ただし、信頼できる人からの紹介があると、より多くの人に届きやすくなります。'
  }
];

export default function PostingGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">投稿のコツ</h1>
        <p className="text-lg text-gray-600">
          NeedPortでのニーズ投稿の流れとコツをご紹介します。気軽に始めて、地域の仲間とつながりましょう。
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">投稿の流れ</h2>
            
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
