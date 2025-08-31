export const metadata = { title: '特定商取引法に基づく表示 | NeedPort' };
export default function Tokushoho() {
  return (
    <main className="prose mx-auto p-6">
      <h1>特定商取引法に基づく表示</h1>
      <table>
        <tbody>
          <tr><th>販売業者</th><td>（社名・屋号）</td></tr>
          <tr><th>運営責任者</th><td>（氏名）</td></tr>
          <tr><th>所在地</th><td>（住所）</td></tr>
          <tr><th>連絡先</th><td>（メール/電話）</td></tr>
          <tr><th>販売価格</th><td>各ページに表示（成約手数料/サブスク）</td></tr>
          <tr><th>代金の支払時期・方法</th><td>Stripeによるオンライン決済または銀行振込</td></tr>
          <tr><th>役務の提供時期</th><td>決済確認後ただちに/各サービスの定めによる</td></tr>
          <tr><th>返品・キャンセル</th><td>提供特性上、原則不可。個別協議。</td></tr>
        </tbody>
      </table>
      <p className="text-sm text-gray-500">※ 法務レビュー前の暫定表記。公開前に確定してください。</p>
    </main>
  );
}
