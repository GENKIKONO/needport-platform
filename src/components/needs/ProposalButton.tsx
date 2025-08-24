'use client';

import { useState } from 'react';
import ProposalModal from './ProposalModal';

interface ProposalButtonProps {
  needId: string;
  needTitle: string;
}

export default function ProposalButton({ needId, needTitle }: ProposalButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
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
