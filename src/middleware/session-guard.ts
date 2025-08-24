// 開発用セッション管理ユーティリティ
// 将来はClerkに差し替え予定

interface DevUser {
  id: string;
  email: string;
  name: string;
  isRegistered: boolean;
  role?: 'guest' | 'general' | 'vendor' | 'admin';
}

// 開発用メモリストア（実際のアプリではDB/Redis使用）
const devStore = new Map<string, DevUser>();

export async function getDevSession(): Promise<DevUser | null> {
  // ブラウザ環境ではlocalStorageから取得
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return {
          id: user.id || 'dev-user-1',
          email: user.email,
          name: user.name,
          isRegistered: true // 登録済みとして扱う
        };
      } catch {
        return null;
      }
    }
  }
  
  // サーバーサイドではクッキーからロールを取得
  try {
    // 動的インポートでnext/headersを使用
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const role = cookieStore.get('dev-role')?.value as 'guest' | 'general' | 'vendor' | 'admin' || 'guest';
    
    return {
      id: 'dev-user-1',
      email: 'test@example.com',
      name: 'テストユーザー',
      isRegistered: role !== 'guest',
      role
    };
  } catch (error) {
    // クッキー取得に失敗した場合はデフォルト
    return {
      id: 'dev-user-1',
      email: 'test@example.com',
      name: 'テストユーザー',
      isRegistered: false,
      role: 'guest'
    };
  }
}

export function isRegistered(userId: string): boolean {
  const user = getDevSession();
  return user?.isRegistered || false;
}

export function createDevSession(userData: { email: string; name: string }): DevUser {
  const user: DevUser = {
    id: `dev-user-${Date.now()}`,
    email: userData.email,
    name: userData.name,
    isRegistered: true
  };
  
  // ブラウザ環境ではlocalStorageに保存
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
  
  devStore.set(user.id, user);
  return user;
}

export function clearDevSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
}
