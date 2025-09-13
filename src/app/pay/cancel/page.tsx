import type { Metadata } from "next";
import Link from "next/link";

/**
 * Payment Cancel Page (Lv1: Deposit checkout cancelled)
 * 
 * Shown when user cancels Stripe Checkout
 * - Lv1: Manual operator-led policy (no payment processed)
 */

export const metadata: Metadata = {
  title: "決済キャンセル | NeedPort",
  description: "デポジット決済がキャンセルされました。",
};

export default function PaymentCancelPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const needId = searchParams.needId as string;
  const proposalId = searchParams.proposalId as string;

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <div className="text-center space-y-4">
        {/* Cancel Icon */}
        <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-orange-800">決済がキャンセルされました</h1>
        <p className="text-slate-600">
          デポジット決済は完了していません。連絡先情報は解放されていません。
        </p>
      </div>

      {/* Status Information */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
        <h2 className="font-semibold text-orange-900">ℹ️ 現在の状況</h2>
        <div className="text-orange-800 text-sm space-y-1">
          <p>• デポジット決済: キャンセル済み</p>
          <p>• 連絡先情報: 未解放</p>
          <p>• 課金: 発生していません</p>
        </div>
      </div>

      {/* Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 次のステップ</h3>
        <div className="text-blue-800 text-sm space-y-1">
          <p>• 再度決済を試す場合は、下のボタンから再開できます</p>
          <p>• 決済完了後に連絡先情報が解放されます</p>
          <p>• 不成立時は運営判断による返金処理を行います</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {needId && (
          <Link
            href={`/needs/${needId}/unlock`}
            className="block w-full text-center px-4 py-3 rounded bg-sky-600 text-white hover:bg-sky-700 font-semibold"
          >
            デポジット決済を再試行
          </Link>
        )}
        
        {needId && (
          <Link
            href={`/needs/${needId}`}
            className="block w-full text-center px-4 py-2 rounded border border-sky-600 text-sky-600 hover:bg-sky-50"
          >
            ニーズ詳細に戻る
          </Link>
        )}

        {proposalId && (
          <Link
            href={`/proposals/${proposalId}`}
            className="block w-full text-center px-4 py-2 rounded border hover:bg-slate-50"
          >
            提案詳細に戻る
          </Link>
        )}
      </div>

      <div className="text-center space-y-2">
        <p className="text-xs text-slate-500">
          決済に問題がある場合は、サポートまでお問い合わせください。
        </p>
        <Link href="/" className="text-slate-600 hover:text-slate-800 text-sm">
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}