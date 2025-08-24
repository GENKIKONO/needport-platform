'use client';

import { useState, useEffect } from 'react';
import Section from './Section';
import { events } from '@/lib/events';

interface Preferences {
  emailNotifications: boolean;
  browserNotifications: boolean;
  twoFactorEnabled: boolean;
}

export default function SecurityPanel({ userId }: { userId: string }) {
  const [preferences, setPreferences] = useState<Preferences>({
    emailNotifications: true,
    browserNotifications: false,
    twoFactorEnabled: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 設定を読み込み
    const loadPreferences = async () => {
      try {
        const response = await fetch('/api/me/preferences');
        if (response.ok) {
          const data = await response.json();
          setPreferences(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    };
    loadPreferences();
  }, []);

  const handleToggle = async (key: keyof Preferences) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key]
    };
    
    setPreferences(newPreferences);
    setLoading(true);
    
    try {
      const response = await fetch('/api/me/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPreferences)
      });
      
      if (response.ok) {
        events.trackEvent(userId || 'anonymous', 'me.toggle_notifications', { 
          type: key, 
          enabled: newPreferences[key] 
        });
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      // 失敗時は元に戻す
      setPreferences(prev => ({ ...prev, [key]: !newPreferences[key] }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section title="セキュリティ・通知設定" description="アカウントのセキュリティと通知設定">
      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4">通知設定</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-700">メール通知</h4>
                <p className="text-sm text-gray-600">取引の進捗や重要な更新をお知らせします</p>
              </div>
              <button
                onClick={() => handleToggle('emailNotifications')}
                disabled={loading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-700">ブラウザ通知</h4>
                <p className="text-sm text-gray-600">チャットメッセージや取引更新をリアルタイムで通知</p>
              </div>
              <button
                onClick={() => handleToggle('browserNotifications')}
                disabled={loading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.browserNotifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.browserNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4">セキュリティ</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-700">二要素認証（2FA）</h4>
                <p className="text-sm text-gray-600">アカウントのセキュリティを強化します</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">準備中</span>
                <button
                  disabled
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 cursor-not-allowed"
                >
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-900 mb-1">セキュリティのヒント</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 強力なパスワードを使用してください</li>
                <li>• 公共のWi-Fiではログアウトしてください</li>
                <li>• 不審なメールやリンクに注意してください</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4">アカウント情報</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">アカウント作成日</span>
              <span className="text-sm text-gray-900">2024年1月1日</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">最終ログイン</span>
              <span className="text-sm text-gray-900">今日 14:30</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">ログインIP</span>
              <span className="text-sm text-gray-900">192.168.1.1</span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
