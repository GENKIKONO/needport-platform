'use client';

import { useState, useEffect } from 'react';
import { label } from '@/lib/ui/labels';
import { lintProposal, type LintIssue } from '@/lib/proposals/lint';
import { upsert, type ProposalDraft } from '@/lib/proposals/local-store';

interface ProposalFormProps {
  needId: string;
  onSaved?: (draft: ProposalDraft) => void;
  onCancel?: () => void;
}

export default function ProposalForm({ needId, onSaved, onCancel }: ProposalFormProps) {
  const [form, setForm] = useState({
    vendorName: '',
    priceJpy: 0,
    durationWeeks: 1,
    deliverables: [''],
    riskNotes: '',
    terms: ''
  });
  
  const [issues, setIssues] = useState<LintIssue[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lint on form change
  useEffect(() => {
    const newIssues = lintProposal(form);
    setIssues(newIssues);
  }, [form]);

  const addDeliverable = () => {
    setForm(prev => ({
      ...prev,
      deliverables: [...prev.deliverables, '']
    }));
  };

  const removeDeliverable = (index: number) => {
    setForm(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }));
  };

  const updateDeliverable = (index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      deliverables: prev.deliverables.map((d, i) => i === index ? value : d)
    }));
  };

  const hasErrors = issues.some(i => i.severity === 'error');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors) return;

    setIsSubmitting(true);
    
    try {
      const draft: ProposalDraft = {
        id: crypto.randomUUID?.() ?? String(Date.now()),
        needId,
        vendorName: form.vendorName,
        priceJpy: form.priceJpy,
        durationWeeks: form.durationWeeks,
        deliverables: form.deliverables.filter(Boolean),
        riskNotes: form.riskNotes || undefined,
        terms: form.terms || undefined,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      upsert(draft);
      onSaved?.(draft);
    } catch (error) {
      console.error('Failed to save proposal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto" data-testid="proposal-form">
      <h2 className="text-xl font-semibold mb-4">提案を作成</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ベンダー名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ベンダー名 *
          </label>
          <input
            type="text"
            value={form.vendorName}
            onChange={(e) => setForm(prev => ({ ...prev, vendorName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* 価格・期間 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              価格（円） *
            </label>
            <input
              type="number"
              value={form.priceJpy}
              onChange={(e) => setForm(prev => ({ ...prev, priceJpy: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              期間（週） *
            </label>
            <input
              type="number"
              value={form.durationWeeks}
              onChange={(e) => setForm(prev => ({ ...prev, durationWeeks: parseInt(e.target.value) || 1 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              required
            />
          </div>
        </div>

        {/* 成果物 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            成果物 *
          </label>
          {form.deliverables.map((deliverable, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={deliverable}
                onChange={(e) => updateDeliverable(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 要件定義書、実装、テスト"
              />
              {form.deliverables.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDeliverable(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  削除
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addDeliverable}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + 成果物を追加
          </button>
        </div>

        {/* リスク・注意事項 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            リスク・注意事項
          </label>
          <textarea
            value={form.riskNotes}
            onChange={(e) => setForm(prev => ({ ...prev, riskNotes: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="例: 要件確定待ち、技術的リスクなど"
          />
        </div>

        {/* 条件・注意 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            条件・注意
          </label>
          <textarea
            value={form.terms}
            onChange={(e) => setForm(prev => ({ ...prev, terms: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="例: 支払い条件、納期、品質保証など"
          />
        </div>

        {/* Linter結果 */}
        {issues.length > 0 && (
          <div className="border rounded-md p-3">
            <h3 className="text-sm font-medium text-gray-700 mb-2">チェック結果</h3>
            <div className="space-y-1">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className={`text-sm p-2 rounded ${
                    issue.severity === 'error' 
                      ? 'bg-red-50 text-red-700 border border-red-200' 
                      : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  }`}
                  data-testid={`lint-item-${issue.id}`}
                >
                  <div className="font-medium">
                    {issue.severity === 'error' ? 'エラー' : '警告'}: {issue.message}
                  </div>
                  {issue.match && (
                    <div className="text-xs mt-1 opacity-75">
                      検出: {issue.match}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ボタン */}
        <div className="flex gap-3 justify-end pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={hasErrors || isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            data-testid="btn-save-proposal"
          >
            {isSubmitting ? '保存中...' : '提案を送信'}
          </button>
        </div>
      </form>
    </div>
  );
}
