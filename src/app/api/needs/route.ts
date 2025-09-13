import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const NeedInput = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  summary: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  // region/area は受け取っても無視
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const json = await req.json().catch(() => ({}));
    const parse = NeedInput.safeParse(json);
    if (!parse.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parse.error.flatten() }, { status: 400 });
    }

    const input = parse.data;
    const supabase = createClient();

    // DB の実スキーマに合わせて必要最低限のカラムのみ
    const payload = {
      title: input.title,
      summary: input.summary || input.title,
      body: input.body || input.summary || "",
      created_by: userId
      // ❌ area: 入れない（DB列が存在しないため）
    };

    const { data, error } = await supabase.from('needs').insert(payload).select('id').limit(1);
    if (error) {
      console.error('[NEEDS_INSERT_ERROR]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ id: data?.[0]?.id }, { status: 201 });

  } catch (e) {
    console.error('[NEEDS_POST_FATAL]', e);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("needs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error('[NEEDS_GET_ERROR]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ needs: data || [] });
  } catch (error) {
    console.error('[NEEDS_GET_FATAL]', error);
    return NextResponse.json({ error: 'Failed to fetch needs' }, { status: 500 });
  }
}