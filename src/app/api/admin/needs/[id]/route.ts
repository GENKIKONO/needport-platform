import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ ok: false, error: "Need ID required" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { title, min_people, deadline, recruitment_closed } = body;

    // Validation
    if (!title || typeof title !== "string" || title.length < 1 || title.length > 120) {
      return NextResponse.json({ 
        ok: false, 
        error: "タイトルは1文字以上120文字以下で入力してください" 
      }, { status: 400 });
    }

    if (min_people !== undefined && min_people !== null) {
      if (!Number.isInteger(min_people) || min_people <= 0) {
        return NextResponse.json({ 
          ok: false, 
          error: "最低人数は正の整数で入力してください" 
        }, { status: 400 });
      }
    }

    if (deadline !== undefined && deadline !== null) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(deadline)) {
        return NextResponse.json({ 
          ok: false, 
          error: "日付は YYYY-MM-DD 形式で入力してください" 
        }, { status: 400 });
      }
      
      const date = new Date(deadline);
      if (isNaN(date.getTime())) {
        return NextResponse.json({ 
          ok: false, 
          error: "有効な日付を入力してください" 
        }, { status: 400 });
      }
    }

    if (typeof recruitment_closed !== "boolean") {
      return NextResponse.json({ 
        ok: false, 
        error: "recruitment_closed must be a boolean" 
      }, { status: 400 });
    }

    const admin = createAdminClient();
    const payload: Record<string, any> = {
      title: title.trim(),
      recruitment_closed,
      updated_at: new Date().toISOString(),
    };

    if (min_people !== undefined) payload.min_people = min_people;
    if (deadline !== undefined) payload.deadline = deadline;

    const { error } = await admin
      .from("needs")
      .update(payload)
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ 
      ok: false, 
      error: e?.message ?? "Unknown error" 
    }, { status: 500 });
  }
}
