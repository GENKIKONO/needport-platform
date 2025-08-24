// Server Component: サービス航海図（流れ＋使い方を統合）
import { serviceFlow, proposalGuide } from '@/content/service';
import { CheckIcon, ArrowRightIcon } from '@/components/icons';

export default function ServiceOverviewPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">サービス航海図</h1>
          <p className="text-xl text-gray-600">
            NeedPortのサービス利用の流れを詳しくご説明します
          </p>
        </div>

        {/* サービスの流れ */}
        <section id="flow" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">サービスの流れ</h2>
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. ニーズを投稿</h3>
              <p className="text-gray-700 mb-3">
                ほしいもの・困りごとを具体的に登録します。タイトル、概要、カテゴリ、エリアを設定して、誰でも見られる形で公開します。
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>タイトルは具体的で分かりやすく</li>
                <li>概要には背景や目的を含める</li>
                <li>カテゴリとエリアで検索されやすく</li>
                <li>公開範囲と期間を設定</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. 公開・募集</h3>
              <p className="text-gray-700 mb-3">
                公開範囲と期間を設定すると、港（サイト）に掲示されます。関心ボタンで仲間を集め、事業化の目安を可視化します。
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>関心ボタンで仲間を集める</li>
                <li>事業化の目安を可視化</li>
                <li>コメントで詳細を詰める</li>
                <li>期限まで継続的に募集</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. 提案を受け取る</h3>
              <p className="text-gray-700 mb-3">
                事業者からの提案が届き、条件や実現性を比較検討できます。条件・スケジュール・金額などを提示してもらいます。
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>複数の提案を比較検討</li>
                <li>実現性とコストを確認</li>
                <li>スケジュールを調整</li>
                <li>質問で詳細を詰める</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">4. 合意・成立</h3>
              <p className="text-gray-700 mb-3">
                合意したら成立。成立条件・納期・価格を最終確認し、承認制チャットで安全に詳細を詰めます。
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>成立条件を明確化</li>
                <li>納期と価格を確定</li>
                <li>承認制チャットで詳細詰め</li>
                <li>契約書で正式に合意</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">5. 製作・納品</h3>
              <p className="text-gray-700 mb-3">
                事業者は合意内容にもとづき製作・納品を行います。進行状況はマイページで確認できます。
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>進行状況を定期的に報告</li>
                <li>中間成果物を確認</li>
                <li>問題があれば早期対応</li>
                <li>最終成果物を納品</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">6. サポート・フォローアップ</h3>
              <p className="text-gray-700 mb-3">
                受領確認・レビュー・次回への改善を共有します。成立後2か月で海中（アーカイブ）へ移り、共有で再浮上も可能です。
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>受領確認とレビュー</li>
                <li>改善点を次回に活かす</li>
                <li>継続的な関係構築</li>
                <li>海中でアーカイブ保存</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 事業者向けガイド */}
        <section id="vendor-guide" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">提案ガイド（公開）</h2>
          <div className="bg-blue-50 rounded-lg p-8">
            <p className="text-lg text-gray-700 mb-6">{proposalGuide.intro}</p>
            <div className="grid gap-6 md:grid-cols-2">
              {proposalGuide.items.map((item) => (
                <div key={item.key} className="bg-white rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 bg-white rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">提案から着手までの流れ</h3>
              <div className="grid gap-4 md:grid-cols-5">
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">1</div>
                  <p className="text-sm font-medium">募集確認</p>
                  <p className="text-xs text-gray-600">ニーズの詳細を確認</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">2</div>
                  <p className="text-sm font-medium">提案作成</p>
                  <p className="text-xs text-gray-600">条件・価格・納期を提示</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">3</div>
                  <p className="text-sm font-medium">契約</p>
                  <p className="text-xs text-gray-600">合意して契約成立</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">4</div>
                  <p className="text-sm font-medium">着手報告</p>
                  <p className="text-xs text-gray-600">作業開始を報告</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">5</div>
                  <p className="text-sm font-medium">検収</p>
                  <p className="text-xs text-gray-600">成果物の確認</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* よくある質問 */}
        <section id="faq" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">よくある質問</h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Q: 利用料金はいくらですか？</h3>
              <p className="text-gray-700">現在はベータ版のため、基本的な機能は無料でご利用いただけます。詳細な料金体系は後日発表予定です。</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Q: 事業者登録は必要ですか？</h3>
              <p className="text-gray-700">提案を送信する場合は事業者登録が必要です。一般ユーザーとしてニーズを投稿する場合は登録不要です。</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Q: セキュリティは大丈夫ですか？</h3>
              <p className="text-gray-700">すべての通信は暗号化され、個人情報は適切に保護されます。承認制チャットで安全にやり取りできます。</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Q: 取引の安全性は？</h3>
              <p className="text-gray-700">承認制チャットで詳細を詰め、契約書で正式に合意してから作業を開始します。進行状況も常に確認できます。</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">今すぐ始めましょう</h2>
            <p className="text-lg mb-6">あなたのニーズを投稿して、最適な事業者を見つけませんか？</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/needs/new"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                ニーズを投稿する
                <ArrowRightIcon className="w-5 h-5" />
              </a>
              <a
                href="/needs"
                className="inline-flex items-center gap-2 border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                ニーズ一覧を見る
                <ArrowRightIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
