import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";

export const metadata = { title: "提案ガイド（事業者）" };

export default async function VendorProposalGuide(){
  const { userId } = auth();
  const user = await currentUser();

  if (!userId) {
    return <div>ログインが必要です</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/me/vendor" className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">提案ガイド</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* イントロダクション */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">成功する提案の作り方</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              NeedPortで効果的な提案を行い、成約率を高めるためのポイントをご紹介します。
            </p>
          </div>
        </div>

        {/* 提案のポイント */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">効果的な提案のポイント</h3>
            <div className="space-y-8">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">1. 具体的な解決策を提示する</h4>
                <p className="text-base text-gray-600">抽象的な説明ではなく、具体的な実現方法や工程を明確に説明しましょう。</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">2. 実績をアピールする</h4>
                <p className="text-base text-gray-600">類似案件の経験や成果物がある場合は積極的に紹介しましょう。</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">3. 適正な価格設定</h4>
                <p className="text-base text-gray-600">市場価格を調査し、妥当性のある金額を提案しましょう。</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">4. 迅速なレスポンス</h4>
                <p className="text-base text-gray-600">迅速な返答は信頼関係の構築につながります。</p>
              </div>
            </div>
          </div>
        </div>

        {/* 重要な注意事項 */}
        <div className="bg-white rounded-lg shadow-sm mt-8">
          <div className="px-6 py-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">重要な注意事項</h3>
            <div className="space-y-6">
              <div className="p-6 bg-red-50 rounded-lg">
                <h4 className="text-lg font-semibold text-red-800 mb-3">⚠️ 禁止事項</h4>
                <ul className="text-base text-red-700 space-y-2">
                  <li>• 個人情報の要求</li>
                  <li>• 外部サービスへの誘導</li>
                  <li>• プラットフォーム外でのやり取り</li>
                </ul>
              </div>
              <div className="p-6 bg-blue-50 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-800 mb-3">📋 ルール</h4>
                <ul className="text-base text-blue-700 space-y-2">
                  <li>• 24時間以内の返信を心がける</li>
                  <li>• すべてのやり取りはチャット内で完結</li>
                  <li>• 成約時は10%の手数料が発生</li>
                  <li>• 決済はStripeを通じて処理</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-blue-600 rounded-lg shadow-sm mt-8 text-center text-white py-8 px-6">
          <h3 className="text-2xl font-bold mb-4">準備ができたら、早速提案してみましょう！</h3>
          <p className="text-blue-100 text-lg mb-6">
            このガイドを参考に、魅力的な提案を作成して成約を目指しましょう。
          </p>
          <Link
            href="/needs"
            className="inline-flex items-center px-6 py-3 bg-white text-blue-600 text-lg rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            ニーズを探す
          </Link>
        </div>
      </div>
    </div>
  );
}
