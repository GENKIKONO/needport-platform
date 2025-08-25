import { NextRequest } from "next/server";
import { z } from "zod";
import { writeSession } from "@/lib/simpleSession";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

const LoginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => ({}));
    
    const parsed = LoginSchema.safeParse(json);
    if (!parsed.success) {
      return new Response(JSON.stringify({ 
        ok: false, 
        error: "バリデーションエラー",
        issues: parsed.error.flatten() 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { email, password } = parsed.data;
    
    // 簡易セッションを作成（実際の認証は省略）
    const session = {
      email,
      name: email.split('@')[0], // 簡易的にメールアドレスから名前を生成
      userId: randomUUID(),
    };

    // セッションを書き込み
    const response = writeSession(session);
    
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return new Response(JSON.stringify({ 
      ok: false, 
      error: "ログインに失敗しました" 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
