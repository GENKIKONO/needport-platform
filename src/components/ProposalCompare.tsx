'use client';

import { useState } from 'react';
import { label } from '@/lib/ui/labels';
import type { ProposalPreview } from '@/lib/types/b2b';
import { listByNeed } from '@/lib/proposals/local-store';

interface ProposalCompareProps {
  proposals: ProposalPreview[];
  needId: string;
}

type SortField = 'price' | 'duration' | null;
type SortDirection = 'asc' | 'desc';

export default function ProposalCompare({ proposals, needId }: ProposalCompareProps) {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [hireModal, setHireModal] = useState<{ open: boolean; proposal: ProposalPreview | null }>({
    open: false,
    proposal: null
  });

  // 承認済みドラフトを取得してマージ
  const approvedDrafts = listByNeed(needId)
    .filter(d => d.status === 'approved')
    .map(d => ({
      id: d.id,
      vendorName: d.vendorName,
      priceJpy: d.priceJpy,
      durationWeeks: d.durationWeeks,
      deliverables: d.deliverables,
      riskNotes: d.riskNotes,
      updatedAt: d.createdAt,
      featured: d.featured
    }));

  // featuredを先頭、その後demo proposals
  const allProposals = [
    ...approvedDrafts.filter(p => p.featured),
    ...approvedDrafts.filter(p => !p.featured),
    ...proposals
  ];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProposals = [...allProposals].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue: number;
    let bValue: number;
    
    if (sortField === 'price') {
      aValue = a.priceJpy;
      bValue = b.priceJpy;
    } else {
      aValue = a.durationWeeks;
      bValue = b.durationWeeks;
    }
    
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    return (aValue - bValue) * multiplier;
  });

  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="mt-4" data-testid="proposal-compare">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-700">
                {label('Vendor')}
              </th>
              <th 
                className="px-3 py-2 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('price')}
              >
                {label('Price')}
                {sortField === 'price' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th 
                className="px-3 py-2 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('duration')}
              >
                {label('Duration')}
                {sortField === 'duration' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">
                {label('Deliverables')}
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">
                {label('Risk')}
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">
                {label('Updated')}
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">
                ステータス
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-700">
                アクション
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedProposals.map((proposal) => (
              <tr 
                key={proposal.id} 
                className="border-t border-gray-100 hover:bg-gray-50"
                data-testid="proposal-row"
              >
                <td className="px-3 py-2 font-medium text-gray-900">
                  {proposal.vendorName}
                </td>
                <td className="px-3 py-2 text-gray-700">
                  {formatPrice(proposal.priceJpy)}
                </td>
                <td className="px-3 py-2 text-gray-700">
                  {proposal.durationWeeks}週
                </td>
                <td className="px-3 py-2 text-gray-700">
                  <div className="flex flex-wrap gap-1">
                    {proposal.deliverables.map((item, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2 text-gray-700">
                  {proposal.riskNotes ? (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                      {proposal.riskNotes}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-3 py-2 text-gray-500 text-xs">
                  {proposal.updatedAt ? formatDate(proposal.updatedAt) : '-'}
                </td>
                <td className="px-3 py-2 text-gray-700">
                  {approvedDrafts.some(d => d.id === proposal.id) ? '承認済み' : 'デモ'}
                </td>
                <td className="px-3 py-2 text-gray-700">
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                    onClick={() => setHireModal({ open: true, proposal })}
                    data-testid="btn-hire"
                  >
                    {label('Hire')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* <HireDisabledModal
        open={hireModal.open}
        onClose={() => setHireModal({ open: false, proposal: null })}
        proposal={hireModal.proposal}
      /> */}
    </div>
  );
}
