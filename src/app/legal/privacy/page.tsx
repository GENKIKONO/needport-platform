import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function PrivacyPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <ShieldCheckIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-[var(--c-text)] mb-2">プライバシーポリシー</h1>
          <p className="text-[var(--c-text-muted)]">
            最終更新日: 2024年1月1日
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="prose max-w-none">
            <h2>1. 個人情報の取得</h2>
            <p>
              当社は、本サービスの提供にあたり、以下の個人情報を取得いたします。
            </p>
            <ul>
              <li>氏名</li>
              <li>メールアドレス</li>
              <li>電話番号</li>
              <li>住所</li>
              <li>その他、当社が定める入力フォームにユーザーが入力する情報</li>
            </ul>

            <h2>2. 個人情報の利用目的</h2>
            <p>当社は、取得した個人情報を以下の目的で利用いたします。</p>
            <ul>
              <li>本サービスの提供・運営のため</li>
              <li>ユーザーからのお問い合わせに対応するため</li>
              <li>利用規約に違反する行為に対応するため</li>
              <li>その他、当社の事業に付随する目的のため</li>
            </ul>

            <h2>3. 個人情報の第三者提供</h2>
            <p>
              当社は、ユーザーから同意を得た場合、または法令に基づき開示することが必要である場合を除き、個人情報を第三者に提供いたしません。
            </p>

            <h2>4. 個人情報の管理</h2>
            <p>
              当社は、ユーザーの個人情報を正確かつ最新の状態に保ち、個人情報の漏洩、滅失またはき損の防止その他の個人情報の安全管理のために必要かつ適切な措置を講じます。
            </p>

            <h2>5. 個人情報の開示・訂正・利用停止</h2>
            <p>
              ユーザーは、当社に対して、個人情報の開示、訂正、利用停止を求めることができます。これらの請求に対して、当社は速やかに対応いたします。
            </p>

            <h2>6. クッキーの使用</h2>
            <p>
              当社は、ユーザーの利便性を向上させるためにクッキーを使用することがあります。クッキーにより収集された情報は、当社のサービス向上のために利用されます。
            </p>

            <h2>7. お問い合わせ</h2>
            <p>
              本ポリシーに関するお問い合わせは、以下の窓口までお願いいたします。
            </p>
            <p>
              株式会社NeedPort<br />
              メール: privacy@needport.jp<br />
              電話: 03-1234-5678
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
