import { NextRequest, NextResponse } from 'next/server';

// モックデータストア（実際のアプリではDB使用）
const mockPreferences = new Map<string, any>();

export async function GET() {
  try {
    // 開発用デフォルト設定
    const defaultPreferences = {
      emailNotifications: true,
      browserNotifications: false,
      twoFactorEnabled: false
    };

    return NextResponse.json(defaultPreferences);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // バリデーション
    const preferences = {
      emailNotifications: Boolean(body.emailNotifications),
      browserNotifications: Boolean(body.browserNotifications),
      twoFactorEnabled: Boolean(body.twoFactorEnabled)
    };

    // モック保存（実際のアプリではDBに保存）
    const userId = 'dev-user-1'; // 開発用固定ID
    mockPreferences.set(userId, preferences);

    // 開発用：localStorageに保存
    if (typeof window !== 'undefined') {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
    }

    return NextResponse.json({ 
      ok: true, 
      preferences,
      message: 'Preferences updated successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
