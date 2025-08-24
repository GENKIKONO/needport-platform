import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Need schema matching database structure
const NeedSchema = z.object({
  title: z.string().min(1, "タイトルは必須です").max(100, "タイトルは100文字以内で入力してください"),
  summary: z.string().min(1, "概要は必須です").max(500, "概要は500文字以内で入力してください"),
  body: z.string().optional(),
  area: z.string().min(1, "エリアは必須です"),
  category: z.string().optional(),
  quantity: z.number().optional(),
  desiredTiming: z.string().optional(),
});

// GET /api/needs → 公開ニーズの一覧
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
  const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") ?? "10"), 1), 50);
  const q = searchParams.get("q") ?? undefined;

  try {
    const supabase = createAdminClient();
    
    let query = supabase
      .from('needs')
      .select('*')
      .order('created_at', { ascending: false });

    // キーワード検索（title と summary）
    if (q) {
      query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%`);
    }

    const { data: items, error } = await query
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ items: [], total: 0, page, pageSize }, { status: 200 });
    }

    return NextResponse.json({ 
      items: items || [], 
      total: items?.length || 0, 
      page, 
      pageSize 
    });
  } catch (error) {
    console.error('Error in GET /api/needs:', error);
    return NextResponse.json({ items: [], total: 0, page, pageSize }, { 
      status: 200,
      headers: { 'cache-control': 'no-store' }
    });
  }
}

// POST /api/needs → ニーズ投稿
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const json = await req.json().catch(() => ({}));
    
    // Zodバリデーション
    const parsed = NeedSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ 
        error: "バリデーションエラー", 
        issues: parsed.error.flatten() 
      }, { status: 400 });
    }

    const { title, summary, body, area, category } = parsed.data;
    
    const supabase = createAdminClient();
    
    // 簡易なSQLクエリで挿入（型エラー回避）
    const { data, error } = await supabase.rpc('create_need', {
      p_title: title,
      p_summary: summary,
      p_body: body || summary,
      p_area: area,
      p_tags: category ? [category] : [],
      p_created_by: userId
    });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ id: 'created' }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/needs:', error);
    return NextResponse.json({ error: "投稿に失敗しました" }, { status: 500 });
  }
}
