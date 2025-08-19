'use client';

import { useState } from 'react';

const audienceTypes = [
  {
    id: 'general',
    label: '一般の方',
    description: 'ニーズを探して賛同する',
    icon: '👤',
    color: 'bg-blue-50 border-blue-200 text-blue-700'
  },
  {
    id: 'business',
    label: '事業者の方',
    description: 'サービスを提供する',
    icon: '🏢',
    color: 'bg-green-50 border-green-200 text-green-700'
  },
  {
    id: 'government',
    label: '自治体の方',
    description: '地域の課題を解決する',
    icon: '🏛️',
    color: 'bg-purple-50 border-purple-200 text-purple-700'
  },
  {
    id: 'supporter',
    label: 'サポーターの方',
    description: 'プロジェクトを支援する',
    icon: '🤝',
    color: 'bg-orange-50 border-orange-200 text-orange-700'
  }
];

interface AudienceGridProps {
  onSelectionChange: (audienceId: string) => void;
}

export default function AudienceGrid({ onSelectionChange }: AudienceGridProps) {
  const [selectedAudience, setSelectedAudience] = useState('general');

  const handleSelection = (audienceId: string) => {
    setSelectedAudience(audienceId);
    onSelectionChange(audienceId);
  };

  return (
    <section className="mx-auto max-w-6xl px-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">あなたはどちらですか？</h2>
        <p className="text-gray-600">対象に応じたおすすめコンテンツをご案内します</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {audienceTypes.map((audience) => (
          <button
            key={audience.id}
            onClick={() => handleSelection(audience.id)}
            className={`p-6 rounded-xl border-2 transition-all hover:shadow-md ${
              selectedAudience === audience.id
                ? `${audience.color} shadow-md`
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="text-3xl mb-3" aria-hidden="true">{audience.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{audience.label}</h3>
              <p className="text-sm text-gray-600">{audience.description}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
