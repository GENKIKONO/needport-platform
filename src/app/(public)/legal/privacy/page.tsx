export const metadata = { title: 'プライバシーポリシー | NeedPort' };
export default function Privacy() {
  return (
    <main className="prose mx-auto p-6">
      <h1>プライバシーポリシー</h1>
      <p>本サービスは、個人情報保護法その他関連法令等を遵守し…（ドラフト）</p>
      <h2>1. 取得する情報</h2><ul><li>アカウント情報</li><li>ログ情報（IP、UA）</li><li>決済関連情報（Stripe管理下）</li></ul>
      <h2>2. 利用目的</h2><p>サービス提供、問い合わせ対応、不正防止、分析等</p>
      <h2>3. 第三者提供</h2><p>法令等に基づく場合を除き、本人同意なく提供しません。</p>
      <h2>4. 安全管理措置</h2><p>アクセス制御、暗号化、監査ログ等</p>
      <h2>5. 問い合わせ窓口</h2><p>お問い合わせページよりご連絡ください。</p>
      <p className="text-sm text-gray-500">※ 法務レビュー前の暫定文言。公開前に確定してください。</p>
    </main>
  );
}
