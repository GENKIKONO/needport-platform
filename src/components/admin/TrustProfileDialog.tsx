'use client';

import { useEffect, useState } from 'react';

type TrustProfile = {
  userId: string;
  email?: string;
  trustScore: number;
  endorsements: number;
  completedNeeds: number;
  hasReferrer: boolean;
  createdAt: string;
};

export default function TrustProfileDialog({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<TrustProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [endorsing, setEndorsing] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`/api/trust/users/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (error) {
        console.error('Failed to load trust profile:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [userId]);

  const handleEndorse = async () => {
    if (endorsing) return;
    
    setEndorsing(true);
    try {
      const res = await fetch('/api/trust/endorse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      if (res.ok) {
        // プロフィールを再読み込み
        const profileRes = await fetch(`/api/trust/users/${userId}`);
        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile(data);
        }
        
        window.dispatchEvent(new CustomEvent("toast", { 
          detail: { type: "success", message: "推薦しました" }
        }));
      }
    } catch (error) {
      console.error('Failed to endorse:', error);
      window.dispatchEvent(new CustomEvent("toast", { 
        detail: { type: "error", message: "推薦に失敗しました" }
      }));
    } finally {
      setEndorsing(false);
    }
  };

  const getTrustBadge = (score: number) => {
    if (score >= 70) return { text: 'HIGH', className: 'bg-green-100 text-green-800', dotClass: 'trust-dot high' };
    if (score >= 40) return { text: 'MID', className: 'bg-yellow-100 text-yellow-800', dotClass: 'trust-dot mid' };
    return { text: 'LOW', className: 'bg-red-100 text-red-800', dotClass: 'trust-dot low' };
  };

  if (loading) {
    return <div className="text-sm text-gray-500">読み込み中...</div>;
  }

  if (!profile) {
    return <div className="text-sm text-gray-500">プロフィールが見つかりません</div>;
  }

  const badge = getTrustBadge(profile.trustScore);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-900">信頼プロフィール</h3>
      <div className="p-3 bg-gray-50 rounded space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">信頼スコア</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{profile.trustScore}</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${badge.className}`}>
              <span className={badge.dotClass} aria-hidden="true"></span>
              {badge.text}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-600">推薦:</span>
            <span className="ml-1 font-medium">{profile.endorsements}</span>
          </div>
          <div>
            <span className="text-gray-600">完了案件:</span>
            <span className="ml-1 font-medium">{profile.completedNeeds}</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-600">
          紹介元: {profile.hasReferrer ? 'あり' : 'なし'}
        </div>
        
        <div className="text-xs text-gray-600">
          登録: {new Date(profile.createdAt).toLocaleDateString('ja-JP')}
        </div>
        
        <button
          onClick={handleEndorse}
          disabled={endorsing}
          className="w-full mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
          aria-label="このユーザーを推薦する"
        >
          {endorsing ? '処理中...' : '+ 推薦'}
        </button>
      </div>
    </div>
  );
}
