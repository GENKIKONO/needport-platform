import { DocumentTextIcon } from '@heroicons/react/24/outline';

export default function TokushoPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <DocumentTextIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-[var(--c-text)] mb-2">特定商取引法に基づく表記</h1>
          <p className="text-[var(--c-text-muted)]">
            最終更新日: 2024年1月1日
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="prose max-w-none">
            <h2>事業者の名称</h2>
            <p>株式会社NeedPort</p>

            <h2>代表者</h2>
            <p>代表取締役 山田太郎</p>

            <h2>所在地</h2>
            <p>〒150-0002<br />
            東京都渋谷区○○○○</p>

            <h2>連絡先</h2>
            <p>
              電話番号: 03-1234-5678<br />
              メールアドレス: info@needport.jp<br />
              受付時間: 平日 9:00〜18:00（土日祝日・年末年始を除く）
            </p>

            <h2>URL</h2>
            <p>https://needport.jp</p>

            <h2>取引価格</h2>
            <p>
              本サービスは基本的に無料でご利用いただけます。<br />
              一部の機能については、別途料金が発生する場合があります。
            </p>

            <h2>支払方法</h2>
            <p>
              クレジットカード決済、銀行振込等<br />
              詳細は各取引時にご案内いたします。
            </p>

            <h2>支払時期</h2>
            <p>
              有料サービスの利用時<br />
              詳細は各取引時にご案内いたします。
            </p>

            <h2>商品等の引き渡し時期</h2>
            <p>
              デジタルコンテンツ: 決済完了後、即座にご利用いただけます。<br />
              その他のサービス: 各サービスにより異なります。
            </p>

            <h2>返品・キャンセルについて</h2>
            <p>
              デジタルコンテンツの性質上、原則として返品・キャンセルはできません。<br />
              ただし、法令に基づく場合や、当社が認める特別な事情がある場合は、返金等の対応をいたします。
            </p>

            <h2>返品・キャンセル条件</h2>
            <p>
              サービス開始前: 全額返金<br />
              サービス開始後: 返金不可（特別な事情がある場合を除く）
            </p>

            <h2>返品・キャンセル時期</h2>
            <p>
              サービス開始前まで<br />
              詳細は各サービスにより異なります。
            </p>

            <h2>返品・キャンセル方法</h2>
            <p>
              お問い合わせフォームまたはメールにてご連絡ください。<br />
              連絡先: support@needport.jp
            </p>

            <h2>運送時の損害の責任所在</h2>
            <p>
              デジタルコンテンツのため、運送時の損害は発生しません。
            </p>

            <h2>クーリング・オフ</h2>
            <p>
              本サービスは特定商取引法第48条の2第1項に規定する通信販売に該当し、クーリング・オフの対象外となります。
            </p>

            <h2>動作環境</h2>
            <p>
              推奨ブラウザ: Chrome、Safari、Firefox、Edge（最新版）<br />
              推奨デバイス: PC、スマートフォン、タブレット
            </p>

            <h2>利用規約</h2>
            <p>
              <a href="/legal/terms" className="text-blue-600 hover:text-blue-700">
                利用規約
              </a>
              をご確認ください。
            </p>

            <h2>プライバシーポリシー</h2>
            <p>
              <a href="/legal/privacy" className="text-blue-600 hover:text-blue-700">
                プライバシーポリシー
              </a>
              をご確認ください。
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
