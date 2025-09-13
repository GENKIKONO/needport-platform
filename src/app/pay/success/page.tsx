import type { Metadata } from "next";
import Link from "next/link";

/**
 * Payment Success Page (Lv1: Deposit held)
 * 
 * Shown after successful Stripe Checkout completion
 * - Lv1: Manual operator-led release/refund policy
 */

export const metadata: Metadata = {
  title: "決済完了 | NeedPort",
  description: "デポジット決済が完了しました。連絡先情報が解放されました。",
};

export default function PaymentSuccessPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const needId = searchParams.needId as string;
  const proposalId = searchParams.proposalId as string;
  const sessionId = searchParams.session_id as string;

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <div className="text-center space-y-4">
        {/* Success Icon */}
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-green-800">決済が完了しました</h1>
        <p className="text-slate-600">
          デポジット決済が正常に処理され、連絡先情報が解放されました。
        </p>
      </div>

      {/* Status Information */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
        <h2 className="font-semibold text-green-900">✅ 処理完了</h2>
        <div className="text-green-800 text-sm space-y-1">
          <p>• デポジット決済: 完了</p>
          <p>• 連絡先情報: 解放済み</p>
          <p>• ステータス: 保留（held）</p>
          {sessionId && (
            <p className="text-xs text-green-600">Session ID: {sessionId}</p>
          )}
        </div>
      </div>

      {/* Lv1 Policy Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">📋 Lv1 運営主導方針</h3>
        <div className="text-blue-800 text-sm space-y-1">
          <p>• 成約時: デポジットは成功報酬に自動充当</p>
          <p>• 不成立時: 運営判断による手動返金</p>
          <p>• 24時間ルール: 連絡不可の場合は返金対象</p>
          <p>• 返金処理: 2-3営業日程度</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {needId && (
          <Link
            href={`/needs/${needId}`}
            className="block w-full text-center px-4 py-3 rounded bg-sky-600 text-white hover:bg-sky-700 font-semibold"
          >
            ニーズ詳細に戻る（連絡先確認）
          </Link>
        )}
        
        {proposalId && (
          <Link
            href={`/proposals/${proposalId}`}
            className="block w-full text-center px-4 py-2 rounded border border-sky-600 text-sky-600 hover:bg-sky-50"
          >
            提案詳細を確認
          </Link>
        )}

        <Link
          href="/me/payments"
          className="block w-full text-center px-4 py-2 rounded border hover:bg-slate-50"
        >
          決済履歴を確認
        </Link>
      </div>

      <div className="text-center">
        <Link href="/" className="text-slate-600 hover:text-slate-800 text-sm">
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}