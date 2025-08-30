import { NextRequest } from "next/server";
import { z } from "zod";
import { writeSession } from "@/lib/simpleSession";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

const RegisterSchema = z.object({
  name: z.string().min(2, "氏名は2文字以上で入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
  agree: z.boolean().refine(val => val === true, "利用規約に同意してください"),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => ({}));
    
    const parsed = RegisterSchema.safeParse(json);
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

    const { name, email, password } = parsed.data;
    
    // 簡易セッションを作成
    const session = {
      email,
      name,
      userId: randomUUID(),
    };

    // セッションを書き込み
    const response = writeSession(session);
    
    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(JSON.stringify({ 
      ok: false, 
      error: "登録に失敗しました" 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
