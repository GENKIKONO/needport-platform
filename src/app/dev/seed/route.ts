import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  // Production guard - prevent dev endpoints in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Dev endpoints disabled in production' }, { status: 404 });
  }

  try {
    const supabase = createAdminClient();
    
    // Seed data for development
    const seedData = [
      {
        title: "テストニーズ1",
        summary: "これは開発用のテストニーズです",
        body: "詳細な説明がここに入ります",
        tags: ["テスト", "開発"],
        area: "東京",
        mode: "single",
        published: true
      },
      {
        title: "テストニーズ2",
        summary: "もう一つのテストニーズ",
        body: "2番目のテストデータです",
        tags: ["サンプル"],
        area: "大阪",
        mode: "pooled",
        published: true
      }
    ];

    const { data, error } = await supabase
      .from('needs')
      .insert(seedData)
      .select();

    if (error) {
      console.error('[seed] error:', error);
      return NextResponse.json(
        { error: 'Failed to seed data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Seed data created successfully',
      count: data?.length || 0,
      data: data
    });

  } catch (error) {
    console.error('[seed] error:', error);
    return NextResponse.json(
      { error: 'Failed to seed data' },
      { status: 500 }
    );
  }
}
