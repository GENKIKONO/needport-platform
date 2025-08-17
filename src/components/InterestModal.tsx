'use client';
import { useState } from 'react';

type InterestLevel = 'buy' | 'maybe' | 'interest';

interface InterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (level: InterestLevel) => void;
  needTitle: string;
}

export default function InterestModal({ isOpen, onClose, onSelect, needTitle }: InterestModalProps) {
  const [selectedLevel, setSelectedLevel] = useState<InterestLevel | null>(null);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (selectedLevel) {
      onSelect(selectedLevel);
      onClose();
    }
  };

  const levels = [
    {
      id: 'buy' as InterestLevel,
      label: '購入したい',
      description: 'このサービスを利用したい',
      icon: '💳',
      color: 'bg-emerald-500',
    },
    {
      id: 'maybe' as InterestLevel,
      label: '欲しいかも',
      description: '興味があるが検討中',
      icon: '🤔',
      color: 'bg-amber-500',
    },
    {
      id: 'interest' as InterestLevel,
      label: '興味あり',
      description: '情報をもっと知りたい',
      icon: '👀',
      color: 'bg-blue-500',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur">
      <div className="card max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          「{needTitle}」への関心度
        </h3>
        
        <div className="space-y-3 mb-6">
          {levels.map((level) => (
            <label
              key={level.id}
              className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                selectedLevel === level.id
                  ? 'border-brand-500 bg-brand-500/10'
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              <input
                type="radio"
                name="interest"
                value={level.id}
                checked={selectedLevel === level.id}
                onChange={(e) => setSelectedLevel(e.target.value as InterestLevel)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full ${level.color} mr-3 flex-shrink-0`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{level.icon}</span>
                  <span className="font-medium text-white">{level.label}</span>
                </div>
                <p className="text-sm text-neutral-400 mt-1">{level.description}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn btn-ghost flex-1"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedLevel}
            className="btn btn-primary flex-1"
          >
            決定
          </button>
        </div>
      </div>
    </div>
  );
}
