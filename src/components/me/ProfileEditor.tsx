'use client';

import { useState, useEffect } from 'react';
import Section from './Section';
import { events } from '@/lib/events';

interface Profile {
  name: string;
  email: string;
  selfIntro: string;
  area: string;
  skills: string[];
}

const areas = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

const skillOptions = [
  'Webデザイン', 'グラフィックデザイン', 'UI/UXデザイン', 'ロゴデザイン',
  'Web開発', 'アプリ開発', 'システム開発', 'データベース設計',
  'マーケティング', 'SEO', 'SNS運用', 'コンテンツ制作',
  '翻訳', '通訳', 'ライティング', '編集',
  '写真撮影', '動画制作', '音声制作', 'その他'
];

export default function ProfileEditor({ user }: { user: any }) {
  const [profile, setProfile] = useState<Profile>({
    name: user?.name || '',
    email: user?.email || '',
    selfIntro: '',
    area: '',
    skills: []
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // プロフィールデータを読み込み
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/me/profile');
        if (response.ok) {
          const data = await response.json();
          setProfile(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/me/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      
      if (response.ok) {
        setSaved(true);
        events.trackEvent(user?.id || 'anonymous', 'me.save_profile', { profile });
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillToggle = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  return (
    <Section 
      title="プロフィール編集" 
      description="あなたの基本情報を編集できます"
      action={
        <button
          onClick={handleSave}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            loading 
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? '保存中...' : saved ? '保存完了！' : '保存'}
        </button>
      }
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            お名前 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="山田太郎"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            メールアドレス
          </label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            placeholder="example@email.com"
          />
          <p className="text-xs text-gray-500 mt-1">メールアドレスは変更できません</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            自己紹介
          </label>
          <textarea
            value={profile.selfIntro}
            onChange={(e) => setProfile(prev => ({ ...prev, selfIntro: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="あなたの経歴や得意分野について教えてください"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            お住まいの地域
          </label>
          <select
            value={profile.area}
            onChange={(e) => setProfile(prev => ({ ...prev, area: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">選択してください</option>
            {areas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            できること（複数選択可）
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {skillOptions.map(skill => (
              <label key={skill} className="flex items-center">
                <input
                  type="checkbox"
                  checked={profile.skills.includes(skill)}
                  onChange={() => handleSkillToggle(skill)}
                  className="mr-2"
                />
                <span className="text-sm">{skill}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
