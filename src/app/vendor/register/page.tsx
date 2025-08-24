import Link from 'next/link';
import { BuildingOffice2Icon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function VendorRegisterPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <BuildingOffice2Icon className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-[var(--c-text)] mb-2">事業者登録</h1>
          <p className="text-[var(--c-text-muted)]">
            事業者として登録して、ニーズへの提案を行ってください
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <form className="space-y-6">
            {/* ステップ1: 会社基本情報 */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--c-text)] mb-4 flex items-center gap-2">
                <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                会社基本情報
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-[var(--c-text)] mb-1">
                    会社名
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    className="w-full px-3 py-2 border border-[var(--c-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="株式会社サンプル"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="representative" className="block text-sm font-medium text-[var(--c-text)] mb-1">
                    代表者名
                  </label>
                  <input
                    type="text"
                    id="representative"
                    className="w-full px-3 py-2 border border-[var(--c-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="山田太郎"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--c-text)] mb-1">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-3 py-2 border border-[var(--c-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="contact@company.com"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[var(--c-text)] mb-1">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-3 py-2 border border-[var(--c-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="03-1234-5678"
                    required
                  />
                </div>
              </div>
            </div>

            {/* ステップ2: 業務内容・カテゴリ */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--c-text)] mb-4 flex items-center gap-2">
                <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                業務内容・カテゴリ
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                  対応可能なカテゴリ（複数選択可）
                </label>
                <div className="grid md:grid-cols-2 gap-2">
                  {['ビジネス', 'コミュニティ', '教育', '環境', '健康・医療', 'テクノロジー', 'その他'].map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* ステップ3: 対応エリア */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--c-text)] mb-4 flex items-center gap-2">
                <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                対応エリア
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-[var(--c-text)] mb-2">
                  対応可能なエリア（複数選択可）
                </label>
                <div className="grid md:grid-cols-2 gap-2">
                  {['東京都', '大阪府', '京都府', '北海道', '福島県', 'その他'].map((area) => (
                    <label key={area} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                      />
                      {area}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* ステップ4: 証憑アップロード */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--c-text)] mb-4 flex items-center gap-2">
                <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
                証憑アップロード
              </h3>
              
              <div>
                <label htmlFor="documents" className="block text-sm font-medium text-[var(--c-text)] mb-1">
                  事業者証明書類
                </label>
                <input
                  type="file"
                  id="documents"
                  className="w-full px-3 py-2 border border-[var(--c-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                />
                <p className="text-sm text-[var(--c-text-muted)] mt-1">
                  PDF、JPG、PNG形式でアップロードしてください
                </p>
              </div>
            </div>

            {/* 同意チェック */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 mr-2"
                required
              />
              <label htmlFor="terms" className="text-sm text-[var(--c-text-muted)]">
                <Link href="/legal/terms" className="text-purple-600 hover:text-purple-700">
                  利用規約
                </Link>
                と
                <Link href="/legal/privacy" className="text-purple-600 hover:text-purple-700">
                  プライバシーポリシー
                </Link>
                に同意します
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors"
            >
              事業者登録を申請
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--c-border)] text-center">
            <p className="text-sm text-[var(--c-text-muted)]">
              既に事業者登録がお済みの方は{' '}
              <Link href="/vendor/login" className="text-purple-600 hover:text-purple-700">
                ログイン
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
