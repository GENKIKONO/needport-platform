export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { toCsv } from "@/lib/csv";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = createAdminClient();

    // @ts-expect-error - Supabase type issue
    const { data: entries, error } = await admin
      .from("entries")
      .select("id, name, email, count, note, created_at")
      .eq("need_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      return new NextResponse("Failed to fetch entries", { status: 500 });
    }

    const entriesList = entries || [];

    const csv = toCsv(entriesList, [
      { key: "id", label: "ID" },
      { key: "name", label: "名前" },
      { key: "email", label: "メールアドレス" },
      { key: "count", label: "参加人数" },
      { key: "note", label: "備考" },
      { key: "created_at", label: "作成日時" },
    ]);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="entries-${id}.csv"`,
      },
    });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
