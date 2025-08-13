import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ ok: false, error: "Need ID required" }, { status: 400 });
    }

    // Anti-spam: Honeypot check
    const body = await req.json().catch(() => ({}));
    const { name, email, count, note, website } = body;
    
    // If honeypot field is filled, reject
    if (website) {
      return NextResponse.json({ 
        ok: false, 
        error: "申し込みの処理に失敗しました" 
      }, { status: 400 });
    }

    // Anti-spam: Rate limiting
    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const ip = forwarded?.split(",")[0] || realIp || "unknown";
    const today = new Date().toISOString().split("T")[0];

    const supabase = await createClient();
    
    // Check rate limit
    const { data: throttleData } = await supabase
      .from("ip_throttle")
      .select("hits")
      .eq("ip", ip)
      .eq("path", "/api/entries")
      .eq("day", today)
      .single();

    const currentHits = throttleData?.hits || 0;
    if (currentHits >= 30) {
      return NextResponse.json({ 
        ok: false, 
        error: "申し込み回数が上限に達しました。しばらく時間をおいてから再度お試しください。" 
      }, { status: 429 });
    }

    // Update rate limit
    await supabase
      .from("ip_throttle")
      .upsert({
        ip,
        path: "/api/entries",
        day: today,
        hits: currentHits + 1,
        updated_at: new Date().toISOString(),
      });

    // Validation
    if (!name || typeof name !== "string" || name.length < 1 || name.length > 120) {
      return NextResponse.json({ 
        ok: false, 
        error: "名前は1文字以上120文字以下で入力してください" 
      }, { status: 400 });
    }

    if (!email || typeof email !== "string" || email.length < 5 || email.length > 200) {
      return NextResponse.json({ 
        ok: false, 
        error: "メールアドレスは5文字以上200文字以下で入力してください" 
      }, { status: 400 });
    }

    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        ok: false, 
        error: "有効なメールアドレスを入力してください" 
      }, { status: 400 });
    }

    if (!Number.isInteger(count) || count <= 0 || count > 100) {
      return NextResponse.json({ 
        ok: false, 
        error: "参加人数は1以上100以下の整数で入力してください" 
      }, { status: 400 });
    }

    if (note && (typeof note !== "string" || note.length > 500)) {
      return NextResponse.json({ 
        ok: false, 
        error: "備考は500文字以下で入力してください" 
      }, { status: 400 });
    }

    const { error } = await supabase
      .from("entries")
      .insert({
        need_id: id,
        name: name.trim(),
        email: email.trim(),
        count,
        note: note?.trim() || null,
      });

    if (error) {
      console.error("[entries] insert error:", error);
      return NextResponse.json({ 
        ok: false, 
        error: "申し込みの処理に失敗しました" 
      }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[entries] unexpected error:", e);
    return NextResponse.json({ 
      ok: false, 
      error: "予期せぬエラーが発生しました" 
    }, { status: 500 });
  }
}
