'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Section from './Section';

interface Need {
  id: string;
  title: string;
  status: 'published' | 'draft' | 'kaichu';
  createdAt: string;
  updatedAt: string;
  interestCount: number;
  applicationsCount: number;
}

const mockNeeds: Need[] = [
  {
    id: '1',
    title: 'Webサイト制作のデザインを依頼したい',
    status: 'published',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    interestCount: 5,
    applicationsCount: 2
  },
  {
    id: '2',
    title: 'ロゴデザインの制作',
    status: 'kaichu',
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
    interestCount: 3,
    applicationsCount: 1
  },
  {
    id: '3',
    title: 'アプリ開発の企画相談',
    status: 'draft',
    createdAt: '2024-01-08T09:15:00Z',
    updatedAt: '2024-01-08T09:15:00Z',
    interestCount: 0,
    applicationsCount: 0
  }
];

const statusConfig = {
  published: { label: '公開中', color: 'bg-green-100 text-green-800' },
  draft: { label: '下書き', color: 'bg-gray-100 text-gray-800' },
  kaichu: { label: '海中', color: 'bg-blue-100 text-blue-800' }
};

export default function MyNeeds({ userId }: { userId: string }) {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // モックデータを読み込み
    setTimeout(() => {
      setNeeds(mockNeeds);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <Section title="自分の投稿" description="あなたが投稿したニーズ一覧">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Section>
    );
  }

  return (
    <Section 
      title="自分の投稿" 
      description="あなたが投稿したニーズ一覧"
      action={
        <Link 
          href="/needs/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          新しい投稿
        </Link>
      }
    >
      <div className="space-y-4">
        {needs.map((need) => {
          const status = statusConfig[need.status];
          return (
            <div key={need.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900">{need.title}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span>投稿日: {new Date(need.createdAt).toLocaleDateString('ja-JP')}</span>
                    <span>更新日: {new Date(need.updatedAt).toLocaleDateString('ja-JP')}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-blue-600">関心: {need.interestCount}件</span>
                    <span className="text-green-600">応募: {need.applicationsCount}件</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link 
                    href={`/needs/${need.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    詳細を見る
                  </Link>
                  {need.status === 'draft' && (
                    <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                      編集
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {needs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>まだ投稿はありません</p>
            <Link 
              href="/needs/new"
              className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              最初の投稿を作成
            </Link>
          </div>
        )}
      </div>
    </Section>
  );
}
