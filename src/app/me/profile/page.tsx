"use client";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [region, setRegion] = useState("");
  const [bio, setBio] = useState("");

  if (!isLoaded) {
    return <div>読み込み中...</div>;
  }

  if (!user) {
    return <div>ログインが必要です</div>;
  }

  const handleSave = async () => {
    try {
      // プロフィール更新処理
      setIsEditing(false);
      alert("プロフィールを更新しました");
    } catch (error) {
      alert("更新に失敗しました");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/me" className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">プロフィール</h1>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  編集
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-4 py-5 sm:p-6">
            {/* プロフィール画像 */}
            <div className="flex items-center space-x-6 mb-8">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  {user.imageUrl ? (
                    <img src={user.imageUrl} alt="プロフィール" className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">プロフィール画像</h3>
                <p className="text-sm text-gray-500 mb-2">JPEGまたはPNG形式、最大2MB</p>
                {isEditing && (
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    画像を変更
                  </button>
                )}
              </div>
            </div>

            {/* 基本情報 */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    表示名 <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="表示名を入力"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">
                      {displayName || user.firstName || user.emailAddresses?.[0]?.emailAddress?.split('@')[0] || '未設定'}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">他のユーザーに表示される名前です（匿名性を保つため、本名以外を推奨）</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス
                  </label>
                  <p className="text-gray-900 py-2">{user.emailAddresses?.[0]?.emailAddress}</p>
                  <p className="text-xs text-gray-500 mt-1">メールアドレスの変更はClerkのアカウント設定で行えます</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  地域
                </label>
                {isEditing ? (
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">地域を選択</option>
                    <option value="高知市">高知市</option>
                    <option value="南国市">南国市</option>
                    <option value="四万十市">四万十市</option>
                    <option value="香南市">香南市</option>
                    <option value="香美市">香美市</option>
                    <option value="土佐市">土佐市</option>
                    <option value="須崎市">須崎市</option>
                    <option value="宿毛市">宿毛市</option>
                    <option value="土佐清水市">土佐清水市</option>
                    <option value="安芸市">安芸市</option>
                    <option value="室戸市">室戸市</option>
                    <option value="その他">その他</option>
                  </select>
                ) : (
                  <p className="text-gray-900 py-2">{region || '未設定'}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">お住まいの地域（大まかな地域で構いません）</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自己紹介
                </label>
                {isEditing ? (
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="簡単な自己紹介をお書きください（任意）"
                  />
                ) : (
                  <p className="text-gray-900 py-2 whitespace-pre-wrap">{bio || '未設定'}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">興味のある分野や経歴など（最大300文字、任意）</p>
              </div>
            </div>

            {/* 匿名性についての注意 */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">匿名性の保護について</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    NeedPortでは利用者の匿名性を重視しています。表示名には本名ではなく、
                    ニックネームや仮名の使用を推奨します。個人を特定できる詳細な住所などは
                    記載しないようにしてください。
                  </p>
                </div>
              </div>
            </div>

            {/* 編集時のアクションボタン */}
            {isEditing && (
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  保存する
                </button>
              </div>
            )}
          </div>
        </div>

        {/* アカウント連携情報 */}
        <div className="bg-white rounded-lg shadow-sm mt-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">アカウント連携</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Google</p>
                    <p className="text-sm text-gray-500">連携済み</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  連携済み
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}