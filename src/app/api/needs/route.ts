import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authz";
import { audit } from "@/lib/audit";
import { createAdminClient } from "@/lib/supabase/server";

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
  const { userId } = await requireUser();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const input = (await req.json()) as NeedCreateInput;
  if (!input?.title || input.title.length < 2) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  
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
      creator_id: userId,
      status: "published"
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating need:", error);
    return NextResponse.json({ error: "failed to create need" }, { status: 500 });
  }

  await audit("need.create", { userId, id: data.id, title: data.title });

  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}

export async function GET() {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from("needs_public")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching needs:", error);
    return NextResponse.json({ error: "failed to fetch needs" }, { status: 500 });
  }

  return NextResponse.json({ needs: data });
}