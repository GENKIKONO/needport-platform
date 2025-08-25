import { clearSession } from "@/lib/simpleSession";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // セッションをクリア
    const response = clearSession();
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return new Response(JSON.stringify({ 
      ok: false, 
      error: "ログアウトに失敗しました" 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
