"use client";

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import OfferForm from '@/components/OfferForm';
import OffersList from '@/components/OffersList';

interface NeedOfferSectionProps {
  needId: string;
}

export default function NeedOfferSection({ needId }: NeedOfferSectionProps) {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <section className="mt-8 bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">事業者提案</h2>
        <div className="text-center text-gray-500">読み込み中...</div>
      </section>
    );
  }

  const renderOfferForm = () => {
    if (!isSignedIn) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">事業者の方へ</h3>
          <p className="text-blue-800 text-sm mb-3">
            このニーズに提案するには事業者としてログインが必要です。
          </p>
          <div className="flex gap-2">
            <Link
              href="/vendors/login"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              事業者ログイン
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 text-sm rounded hover:bg-blue-50"
            >
              新規登録
            </Link>
          </div>
        </div>
      );
    }

    // ログイン済みの場合、提案フォームを表示
    // 将来的にはユーザーロール（vendor）のチェックを追加予定
    return <OfferForm needId={needId} />;
  };

  return (
    <section className="mt-8 bg-white rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-4">事業者提案</h2>

      {/* 提案フォーム部分 */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">新しい提案を送信</h3>
        {renderOfferForm()}
      </div>

      {/* 提案一覧部分 */}
      <div>
        <OffersList needId={needId} />
      </div>
    </section>
  );
}