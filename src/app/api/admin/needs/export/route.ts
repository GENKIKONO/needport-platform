import { NextRequest, NextResponse } from "next/server";
import { listNeeds } from "@/lib/admin/store";
import { guard } from "../../_util";

export async function GET(req: NextRequest) {
  const g = guard(req); if (g) return g;
  const { rows } = listNeeds({ stage: "all" as any, pageSize: 10000 });
  const header = ["id","title","owner","stage","supporters","proposals","estimateYen","updatedAt"];
  const csv = [header.join(","), ...rows.map(r =>
    [r.id, r.title, r.ownerMasked, r.stage, r.supporters, r.proposals, r.estimateYen ?? "", r.updatedAt].join(",")
  )].join("\n");
  return new NextResponse(csv, { 
    headers: { 
      "Content-Type": "text/csv; charset=utf-8", 
      "Content-Disposition": "attachment; filename=needs.csv" 
    }
  });
}
