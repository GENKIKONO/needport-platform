import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'サポート・お問い合わせ | NeedPort',
  description: 'NeedPortの使い方や安全について、お気軽にご相談ください。',
};

const supportCategories = [
  {
    id: 'usage',
    title: '使い方について',
    description: 'NeedPortの基本的な使い方や機能について',
    icon: (
      <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    id: 'safety',
    title: '安全・セキュリティ',
    description: '個人情報の保護や安全な利用について',
    icon: (
      <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  {
    id: 'trouble',
    title: 'トラブル・不具合',
    description: '技術的な問題や不具合について',
    icon: (
      <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    )
  },
  {
    id: 'business',
    title: '事業者向け',
    description: '事業者登録や提案について',
    icon: (
      <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  }
];

const faqs = [
  {
    id: 1,
    question: 'NeedPortは無料で利用できますか？',
    answer: 'はい、NeedPortの基本的な機能はすべて無料でご利用いただけます。'
  },
  {
    id: 2,
    question: '個人情報は安全に保護されていますか？',
    answer: 'はい、NeedPortでは個人情報の保護を最優先に考え、適切なセキュリティ対策を実施しています。'
  },
  {
    id: 3,
    question: '投稿したニーズを削除できますか？',
    answer: 'はい、マイページから投稿したニーズの削除が可能です。削除後も一定期間は復元できます。'
  },
  {
    id: 4,
    question: '事業者として登録する際の審査はありますか？',
    answer: '基本的な情報確認は行いますが、厳格な審査はありません。ただし、不正利用が判明した場合は登録を取り消す場合があります。'
  }
];

export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">サポート・お問い合わせ</h1>
        <p className="text-lg text-gray-600">
          NeedPortの使い方や安全について、お気軽にご相談ください。迅速にお答えいたします。
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">相談カテゴリ</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {supportCategories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center mb-4">
                    <div className="mr-3">
                      {category.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    相談する →
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">お問い合わせフォーム</h2>
            
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  お名前 *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  相談カテゴリ *
                </label>
                <select
                  id="category"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  <option value="usage">使い方について</option>
                  <option value="safety">安全・セキュリティ</option>
                  <option value="trouble">トラブル・不具合</option>
                  <option value="business">事業者向け</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  お問い合わせ内容 *
                </label>
                <textarea
                  id="message"
                  rows={6}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="詳しくお聞かせください..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                送信する
              </button>
            </form>
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

          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 mt-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">返信について</h3>
            <p className="text-sm text-blue-800">
              通常2-3営業日以内にご返信いたします。<br />
              緊急の場合は、お電話でのお問い合わせも可能です。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
