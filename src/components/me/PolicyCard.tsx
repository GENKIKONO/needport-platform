'use client';

import Section from './Section';
import Link from 'next/link';

export default function PolicyCard() {
  return (
    <Section title="返金・キャンセル規約" description="重要な取引ルールについて">
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-900 mb-2">⚠️ 返金不可について</h4>
          <p className="text-sm text-red-800">
            NeedPortでの取引は原則返金不可です。着手金をお支払いいただいた後は、
            事業者との合意がない限り返金できません。
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-medium text-orange-900 mb-2">🚫 直取引禁止</h4>
          <p className="text-sm text-orange-800">
            プラットフォーム外での直接取引は禁止されています。
            すべてのやり取りはNeedPort内で行ってください。
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">🎫 特例クーポン</h4>
          <p className="text-sm text-blue-800">
            初回利用時や特定条件で利用できるクーポンがあります。
            詳細は各案件ページでご確認ください。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Link 
            href="/terms" 
            className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h4 className="font-medium text-gray-900 mb-1">利用規約</h4>
            <p className="text-sm text-gray-600">サービスの利用条件について</p>
          </Link>

          <Link 
            href="/legal/tokusho" 
            className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h4 className="font-medium text-gray-900 mb-1">特定商取引法</h4>
            <p className="text-sm text-gray-600">法律に基づく表示事項</p>
          </Link>
        </div>

        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">お問い合わせ</h4>
          <p className="text-sm text-gray-700 mb-3">
            返金・キャンセルについてご不明な点がございましたら、お気軽にお問い合わせください。
          </p>
          <Link 
            href="/support" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            サポートに問い合わせる
          </Link>
        </div>
      </div>
    </Section>
  );
}
