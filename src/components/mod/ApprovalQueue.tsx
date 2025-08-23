'use client';

import { useState, useEffect } from 'react';
import { getDevSession } from '@/lib/devAuth';

interface Approval {
  id: string;
  need_id: string;
  applicant_id: string;
  status: string;
  note: string;
  created_at: string;
  updated_at: string;
  needs: {
    id: string;
    title: string;
    user_id: string;
  };
}

export default function ApprovalQueue() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const devSession = getDevSession();

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const response = await fetch('/api/mod/approvals?scope=mine');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '承認キューを取得できませんでした');
      }

      setApprovals(data.approvals || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalId: string, note: string) => {
    try {
      const response = await fetch(`/api/mod/approvals/${approvalId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '承認に失敗しました');
      }

      // 承認キューを再取得
      fetchApprovals();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReject = async (approvalId: string, reason: string, note: string) => {
    try {
      const response = await fetch(`/api/mod/approvals/${approvalId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason, note }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '却下に失敗しました');
      }

      // 承認キューを再取得
      fetchApprovals();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchApprovals}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          再試行
        </button>
      </div>
    );
  }

  if (approvals.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">承認待ちの申請はありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        承認待ちキュー ({approvals.length}件)
      </h3>

      {approvals.map((approval) => (
        <ApprovalItem
          key={approval.id}
          approval={approval}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ))}
    </div>
  );
}

interface ApprovalItemProps {
  approval: Approval;
  onApprove: (id: string, note: string) => void;
  onReject: (id: string, reason: string, note: string) => void;
}

function ApprovalItem({ approval, onApprove, onReject }: ApprovalItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [note, setNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionNote, setRejectionNote] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">
            {approval.needs.title}
          </h4>
          <p className="text-sm text-gray-600">
            申請者: {approval.applicant_id} | 申請日: {formatDate(approval.created_at)}
          </p>
          {approval.note && (
            <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
              {approval.note}
            </p>
          )}
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {isExpanded ? '詳細を閉じる' : '詳細を開く'}
        </button>
      </div>

      {isExpanded && (
        <div className="border-t pt-4 space-y-4">
          {/* 承認フォーム */}
          <div>
            <h5 className="font-medium text-gray-900 mb-2">承認</h5>
            <div className="flex gap-2">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="承認メモ（任意）"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <button
                onClick={() => onApprove(approval.id, note)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                承認
              </button>
            </div>
          </div>

          {/* 却下フォーム */}
          <div>
            <h5 className="font-medium text-gray-900 mb-2">却下</h5>
            <div className="space-y-2">
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">却下理由を選択</option>
                <option value="profile_incomplete">プロフィール情報不足</option>
                <option value="spam_suspected">スパム・荒らしの可能性</option>
                <option value="not_serious">真剣でない申請</option>
                <option value="already_handled">既に解決済み</option>
                <option value="other">その他</option>
              </select>
              
              <input
                type="text"
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                placeholder="却下メモ（任意）"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              
              <button
                onClick={() => onReject(approval.id, rejectionReason, rejectionNote)}
                disabled={!rejectionReason}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm"
              >
                却下
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
