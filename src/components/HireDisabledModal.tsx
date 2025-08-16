'use client';

import { label } from '@/lib/ui/labels';
import { paymentsEnabled } from '@/lib/flags';

interface HireDisabledModalProps {
  open: boolean;
  onClose: () => void;
  proposal: { vendorName: string; priceJpy: number; durationWeeks: number } | null;
}

export default function HireDisabledModal({ open, onClose, proposal }: HireDisabledModalProps) {
  if (!open || !proposal) return null;
  
  const disabled = !paymentsEnabled();
  const milestones = [
    { name: 'Kickoff', percent: 30 },
    { name: 'Delivery', percent: 40 },
    { name: 'Acceptance', percent: 30 },
  ];
  
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-5">
        <h3 className="text-lg font-semibold mb-2">{label('Hire')}: {proposal.vendorName}</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <div>¥{proposal.priceJpy.toLocaleString()} / {proposal.durationWeeks}週</div>
          <div className="mt-2">
            <div className="font-medium">{label('Milestones')}</div>
            <ul className="mt-1 list-disc list-inside text-gray-600">
              {milestones.map(m => <li key={m.name}>{m.name} — {m.percent}%</li>)}
            </ul>
          </div>
          <div className="mt-2 text-xs text-gray-500">{label('EscrowSoon')}</div>
        </div>
        <div className="mt-4 flex gap-2 justify-end">
          <button onClick={onClose} className="btn btn-ghost">
            閉じる
          </button>
          <button 
            disabled 
            className="btn btn-primary disabled:opacity-50 cursor-not-allowed" 
            data-testid="btn-hire-disabled"
          >
            {disabled ? '近日対応（決済OFF）' : 'Hire'}
          </button>
        </div>
      </div>
    </div>
  );
}
