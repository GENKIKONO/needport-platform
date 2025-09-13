import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const InsertSchema = z.object({
  title: z.string().min(1),
  summary: z.string().optional(),
  body: z.string().optional(),
  category: z.string().optional(),
  region: z.string().optional(),
  pii_email: z.string().email().optional(),
  pii_phone: z.string().optional(),
  pii_address: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    const data = InsertSchema.parse(payload);

    const supabase = createClient();
    const { data: inserted, error } = await supabase
      .from("needs")
      .insert({ 
        title: data.title,
        summary: data.summary || data.title,
        body: data.body || data.summary || "",
        area: data.region || null,
        created_by: userId
      })
      .select("id")
      .single();

    if (error) {
      console.error("POST /api/needs Supabase error:", error);
      throw error;
    }
    
    console.log(`[AUDIT] need.create: userId=${userId}, id=${inserted.id}`);
    return NextResponse.json({ id: inserted.id }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/needs failed:", err);
    const message = err?.message || err?.error || "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
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