import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { HTTP_ERRORS, logAndReturnError } from "@/lib/http/error";

type NeedCreateInput = {
  title: string;
  summary?: string;
  body?: string;
  category?: string;
  region?: string;
  pii_email?: string;
  pii_phone?: string;
  pii_address?: string;
};

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return HTTP_ERRORS.UNAUTHORIZED();
    }

    const input = (await req.json()) as NeedCreateInput;
    if (!input?.title || input.title.length < 2) {
      return HTTP_ERRORS.BAD_REQUEST("title required");
    }

    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("needs")
      .insert({
        title: input.title,
        summary: input.summary || input.title,
        body: input.body || input.summary || "",
        category: input.category,
        region: input.region,
        pii_email: input.pii_email,
        pii_phone: input.pii_phone,
        pii_address: input.pii_address,
        creator_id: userId
      })
      .select()
      .single();

    if (error) {
      return logAndReturnError(error, 'POST /api/needs', 'Failed to create need');
    }

    // 簡易監査ログ（audit関数の代替）
    console.log(`[AUDIT] need.create: userId=${userId}, id=${data.id}, title=${data.title}`);

    return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
  } catch (error) {
    return logAndReturnError(error, 'POST /api/needs', 'Failed to create need');
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
      return logAndReturnError(error, 'GET /api/needs', 'Failed to fetch needs');
    }

    return NextResponse.json({ needs: data || [] });
  } catch (error) {
    return logAndReturnError(error, 'GET /api/needs', 'Failed to fetch needs');
  }
}