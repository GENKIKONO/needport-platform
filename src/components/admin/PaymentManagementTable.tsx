"use client";

import { useState, useEffect } from "react";
import { PaymentActionModal } from "./PaymentActionModal";

interface HeldTransaction {
  id: string;
  amount: number;
  vendor_id: string;
  need_id: string;
  proposal_id: string;
  stripe_payment_intent_id: string;
  created_at: string;
  vendor_name?: string;
  need_title?: string;
  status: 'held' | 'completed' | 'refunded';
}

export function PaymentManagementTable() {
  const [transactions, setTransactions] = useState<HeldTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("held");
  const [selectedTransaction, setSelectedTransaction] = useState<HeldTransaction | null>(null);
  const [actionType, setActionType] = useState<'release' | 'refund' | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/payments?status=${statusFilter}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      } else {
        console.error('Failed to fetch transactions');
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.need_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleAction = (transaction: HeldTransaction, action: 'release' | 'refund') => {
    setSelectedTransaction(transaction);
    setActionType(action);
  };

  const closeModal = () => {
    setSelectedTransaction(null);
    setActionType(null);
  };

  const onActionComplete = () => {
    fetchTransactions(); // Refresh list
    closeModal();
  };

  if (loading) {
    return (
      <div className="bg-white border rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
        <p className="mt-2 text-slate-600">held取引を読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="bg-white border rounded-lg p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              検索
            </label>
            <input
              type="text"
              placeholder="ニーズタイトル、事業者名、取引IDで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              ステータス
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="held">held (要処理)</option>
              <option value="completed">完了済み</option>
              <option value="refunded">返金済み</option>
              <option value="all">すべて</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-slate-600">
        {filteredTransactions.length} 件の取引が見つかりました
        {searchTerm && ` (「${searchTerm}」で検索)`}
      </div>

      {/* Transactions Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p>該当する取引がありません</p>
            {statusFilter === 'held' && (
              <p className="text-xs mt-1">held状態の取引がない場合は、まず決済を受け付ける必要があります</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    取引ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    ニーズ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    事業者
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    金額
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    作成日時
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-900 font-mono">
                      {transaction.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      <div className="max-w-xs truncate">
                        {transaction.need_title || 'N/A'}
                      </div>
                      <div className="text-xs text-slate-500">
                        Need: {transaction.need_id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {transaction.vendor_name || 'N/A'}
                      <div className="text-xs text-slate-500">
                        {transaction.vendor_id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 font-semibold">
                      ¥{transaction.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.status === 'held' ? 'bg-yellow-100 text-yellow-800' :
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(transaction.created_at).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {transaction.status === 'held' ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleAction(transaction, 'release')}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            解放
                          </button>
                          <button
                            onClick={() => handleAction(transaction, 'refund')}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            返金
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">処理済み</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {selectedTransaction && actionType && (
        <PaymentActionModal
          transaction={selectedTransaction}
          actionType={actionType}
          onClose={closeModal}
          onComplete={onActionComplete}
        />
      )}
    </div>
  );
}