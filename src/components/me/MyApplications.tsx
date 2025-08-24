'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Section from './Section';

interface Application {
  id: string;
  needTitle: string;
  clientName: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  appliedAt: string;
  amount: number;
  message: string;
}

const mockApplications: Application[] = [
  {
    id: '1',
    needTitle: 'Webサイト制作のデザインを依頼したい',
    clientName: '株式会社サンプル',
    status: 'accepted',
    appliedAt: '2024-01-15T10:30:00Z',
    amount: 500000,
    message: 'デザイン経験豊富です。ご相談ください。'
  },
  {
    id: '2',
    needTitle: 'ロゴデザインの制作',
    clientName: 'デザイン事務所A',
    status: 'pending',
    appliedAt: '2024-01-12T14:20:00Z',
    amount: 150000,
    message: 'シンプルで印象的なロゴを提案します。'
  },
  {
    id: '3',
    needTitle: 'アプリ開発の企画相談',
    clientName: 'テックスタートアップ',
    status: 'rejected',
    appliedAt: '2024-01-10T09:15:00Z',
    amount: 800000,
    message: 'モバイルアプリ開発の実績があります。'
  }
];

const statusConfig = {
  pending: { label: '審査中', color: 'bg-yellow-100 text-yellow-800' },
  accepted: { label: '承認済み', color: 'bg-green-100 text-green-800' },
  rejected: { label: '却下', color: 'bg-red-100 text-red-800' },
  withdrawn: { label: '取り下げ', color: 'bg-gray-100 text-gray-800' }
};

export default function MyApplications({ userId }: { userId: string }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // モックデータを読み込み
    setTimeout(() => {
      setApplications(mockApplications);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <Section title="自分の応募" description="あなたが応募した案件一覧">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Section>
    );
  }

  return (
    <Section title="自分の応募" description="あなたが応募した案件一覧">
      <div className="space-y-4">
        {applications.map((application) => {
          const status = statusConfig[application.status];
          return (
            <div key={application.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900">{application.needTitle}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{application.clientName}</p>
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">{application.message}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>応募日: {new Date(application.appliedAt).toLocaleDateString('ja-JP')}</span>
                    <span className="text-green-600">提案金額: ¥{application.amount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link 
                    href={`/needs/${application.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    詳細を見る
                  </Link>
                  {application.status === 'pending' && (
                    <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                      取り下げ
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {applications.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>まだ応募した案件はありません</p>
            <Link 
              href="/needs"
              className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              案件を探す
            </Link>
          </div>
        )}
      </div>
    </Section>
  );
}
