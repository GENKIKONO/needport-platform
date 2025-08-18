export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { listNeeds } from "@/lib/admin/store";
import { guard } from "../../_util";

function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function createCsvRow(fields: (string | number | null)[]): string {
  return fields.map(field => escapeCsvField(String(field ?? ''))).join(',');
}

export async function GET(req: NextRequest) {
  const g = guard(req); if (g) return g;
  const { rows } = await listNeeds({ stage: "all" as any, pageSize: 10000 });
  
  const header = ["id","title","owner","stage","supporters","proposals","estimateYen","updatedAt"];
  const csvRows = [
    createCsvRow(header),
    ...rows.map(r => createCsvRow([
      r.id, r.title, r.ownerMasked, r.stage, r.supporters, r.proposals, r.estimateYen ?? "", r.updatedAt
    ]))
  ];
  const csv = csvRows.join("\n");
  const bom = '\uFEFF';
  
  console.log('Admin CSV export:', { rowCount: rows.length, timestamp: new Date().toISOString() });
  
  return new NextResponse(bom + csv, { 
    headers: { 
      "Content-Type": "text/csv; charset=utf-8", 
      "Content-Disposition": "attachment; filename=needs.csv" 
    }
  });
}
