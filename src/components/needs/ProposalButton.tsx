'use client';

import { useState } from 'react';
import ProposalModal from './ProposalModal';

interface ProposalButtonProps {
  needId: string;
  needTitle: string;
}

export default function ProposalButton({ needId, needTitle }: ProposalButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // DEMO_MODE のときは常に遷移（未ログインでもOK）
  const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === '1' || process.env.DEMO_MODE === '1';

  const onClick = () => {
    if (DEMO) {
      window.location.href = `/proposal/new?need=${needId}`;
      return;
    }
    // 既存の権限ロジックがあるなら fallback:
    window.location.href = `/auth/register?next=/proposal/new?need=${needId}`;
  };

  return (
    <>
      <button
        onClick={onClick}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
      >
        提案する
      </button>
      
      <ProposalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        needId={needId}
        needTitle={needTitle}
      />
    </>
  );
}
