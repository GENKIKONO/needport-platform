import { NextRequest, NextResponse } from 'next/server';

// モックデータストア（実際のアプリではDB使用）
const mockProfiles = new Map<string, any>();

export async function GET() {
  try {
    // 開発用ダミーデータ
    const defaultProfile = {
      name: 'テストユーザー',
      email: 'test@example.com',
      selfIntro: 'Webデザインとアプリ開発を専門としています。',
      area: '東京都',
      skills: ['Webデザイン', 'アプリ開発']
    };

    return NextResponse.json(defaultProfile);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // バリデーション
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // モック保存（実際のアプリではDBに保存）
    const profile = {
      name: body.name.trim(),
      email: body.email || 'test@example.com',
      selfIntro: body.selfIntro || '',
      area: body.area || '',
      skills: body.skills || []
    };

    // 開発用：localStorageに保存
    if (typeof window !== 'undefined') {
      localStorage.setItem('userProfile', JSON.stringify(profile));
    }

    return NextResponse.json({ 
      ok: true, 
      profile,
      message: 'Profile updated successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
