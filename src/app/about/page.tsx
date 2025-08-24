import { InformationCircleIcon, BuildingOffice2Icon, MapPinIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <InformationCircleIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-[var(--c-text)] mb-2">会社情報</h1>
          <p className="text-[var(--c-text-muted)]">
            NeedPortについて
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-bold text-[var(--c-text)] mb-6">会社概要</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-[var(--c-text)] mb-4">基本情報</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-[var(--c-text-muted)]">会社名</dt>
                  <dd className="text-[var(--c-text)]">株式会社NeedPort</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-[var(--c-text-muted)]">設立</dt>
                  <dd className="text-[var(--c-text)]">2024年1月</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-[var(--c-text-muted)]">代表者</dt>
                  <dd className="text-[var(--c-text)]">代表取締役 山田太郎</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-[var(--c-text-muted)]">事業内容</dt>
                  <dd className="text-[var(--c-text)]">地域ニーズと事業者をマッチングするプラットフォーム運営</dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-[var(--c-text)] mb-4">連絡先</h3>
              <dl className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-[var(--c-text-muted)]" />
                  <div>
                    <dt className="text-sm font-medium text-[var(--c-text-muted)]">住所</dt>
                    <dd className="text-[var(--c-text)]">東京都渋谷区○○○○</dd>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-[var(--c-text-muted)]" />
                  <div>
                    <dt className="text-sm font-medium text-[var(--c-text-muted)]">電話番号</dt>
                    <dd className="text-[var(--c-text)]">03-1234-5678</dd>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4 text-[var(--c-text-muted)]" />
                  <div>
                    <dt className="text-sm font-medium text-[var(--c-text-muted)]">メールアドレス</dt>
                    <dd className="text-[var(--c-text)]">info@needport.jp</dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-bold text-[var(--c-text)] mb-6">ミッション</h2>
          
          <div className="space-y-6">
            <p className="text-[var(--c-text-muted)] leading-relaxed">
              NeedPortは、地域のニーズと事業者をつなぐプラットフォームとして、地域社会の課題解決と経済活性化を目指しています。
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[var(--c-text)] mb-2">地域課題の解決</h3>
                <p className="text-sm text-[var(--c-text-muted)]">
                  地域のニーズを可視化し、適切な解決策を提供
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="bg-green-100 text-green-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[var(--c-text)] mb-2">事業者の成長支援</h3>
                <p className="text-sm text-[var(--c-text-muted)]">
                  地域事業者のビジネス機会創出と成長支援
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="bg-purple-100 text-purple-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[var(--c-text)] mb-2">コミュニティ形成</h3>
                <p className="text-sm text-[var(--c-text-muted)]">
                  持続可能な地域コミュニティの形成
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h2 className="text-2xl font-bold text-[var(--c-text)] mb-6">ビジョン</h2>
          
          <div className="space-y-4">
            <p className="text-[var(--c-text-muted)] leading-relaxed">
              私たちは、すべての地域が持続可能で豊かなコミュニティとなることを目指しています。
            </p>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-[var(--c-text)] mb-2">目指す未来</h3>
              <ul className="text-sm text-[var(--c-text-muted)] space-y-1">
                <li>• 地域の課題が迅速に解決される社会</li>
                <li>• 事業者が地域で活躍できる環境</li>
                <li>• 住民が地域に愛着を持てるコミュニティ</li>
                <li>• 持続可能な地域経済の実現</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
