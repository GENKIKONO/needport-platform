'use client';

import { useState, useEffect } from 'react';
import { Role } from '@/lib/auth/roles';

export default function RoleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role>('guest');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 現在のロールを取得
    fetch('/api/dev/session')
      .then(res => res.json())
      .then(data => {
        if (data.role) {
          setCurrentRole(data.role);
        }
      })
      .catch(console.error);
  }, []);

  const handleRoleChange = async (newRole: Role) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/dev/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        setCurrentRole(newRole);
        setIsOpen(false);
        // ページをリロードして変更を反映
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 本番環境では表示しない
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const roles: { value: Role; label: string }[] = [
    { value: 'guest', label: 'ゲスト' },
    { value: 'general', label: '一般' },
    { value: 'vendor', label: '事業者' },
    { value: 'admin', label: '管理者' },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        {/* FAB */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-colors"
          title="ロール切替"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>

        {/* ドロップダウン */}
        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl border p-4 min-w-[200px]">
            <div className="text-sm font-medium text-gray-700 mb-3">
              現在のロール: {roles.find(r => r.value === currentRole)?.label}
            </div>
            
            <div className="space-y-2">
              {roles.map((role) => (
                <button
                  key={role.value}
                  onClick={() => handleRoleChange(role.value)}
                  disabled={isLoading || currentRole === role.value}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    currentRole === role.value
                      ? 'bg-blue-100 text-blue-700 cursor-default'
                      : 'hover:bg-gray-100 text-gray-700'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {role.label}
                </button>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t text-xs text-gray-500">
              開発環境専用
            </div>
          </div>
        )}
      </div>

      {/* オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
