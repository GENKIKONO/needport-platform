'use client';

import { useState } from 'react';

interface StatusSelectorProps {
  needId: string;
  currentStatus: string;
}

export default function StatusSelector({ needId, currentStatus }: StatusSelectorProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/needs/${needId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setStatus(newStatus);
        // Optionally refresh the page or show success message
        window.location.reload();
      } else {
        console.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-600';
      case 'pending': return 'bg-yellow-600';
      case 'published': return 'bg-green-600';
      case 'archived': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return '下書き';
      case 'pending': return '承認待ち';
      case 'published': return '公開中';
      case 'archived': return 'アーカイブ';
      default: return status;
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-400">ステータス:</span>
      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={isLoading}
        className={`px-3 py-1 text-sm rounded ${getStatusColor(status)} text-white border-none outline-none`}
      >
        <option value="draft">下書き</option>
        <option value="pending">承認待ち</option>
        <option value="published">公開中</option>
        <option value="archived">アーカイブ</option>
      </select>
      {isLoading && (
        <span className="text-sm text-gray-400">更新中...</span>
      )}
    </div>
  );
}
