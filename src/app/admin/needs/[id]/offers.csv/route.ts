// Server route that returns offers as CSV using the same sort params.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort") === "date" ? "created_at" : "amount";
  const order = (searchParams.get("order") ?? "asc") === "asc";

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offers")
    .select("id, vendor_name, amount, created_at")
    .eq("need_id", id)
    .order(sort, { ascending: order, nullsFirst: false });

  if (error) {
    return new NextResponse(error.message, { status: 500 });
  }

  const rows = data ?? [];
  const header = ["id","vendor_name","amount","created_at"];
  const body = rows.map(r => [
    r.id,
    r.vendor_name ?? "",
    String(r.amount ?? 0),
    r.created_at ?? ""
  ]);
  const csv = [header, ...body].map(cols =>
    cols.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")
  ).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="offers-${id}.csv"`,
    },
  });
}
