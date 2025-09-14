import { NextRequest, NextResponse } from "next/server";
import { createAdminClientOrNull } from "@/lib/supabase/admin";
import { withRateLimit, RATE_LIMITS } from "@/lib/rateLimit";

// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';

function createUTF8BOM(): Buffer {
  return Buffer.from([0xEF, 0xBB, 0xBF]);
}

function arrayToCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ];
  
  return csvRows.join('\n');
}

async function exportNeedsHandler(req: NextRequest): Promise<Response> {
  try {
    const supabase = createAdminClientOrNull();
    
    if (!supabase) {
      return NextResponse.json(
        { error: "Admin database not configured" },
        { status: 503 }
      );
    }
    
    // Fetch published needs with basic information
    const { data: needs, error } = await supabase
      .from('needs')
      .select(`
        id,
        title,
        summary,
        price,
        min_people,
        deadline,
        status,
        created_at,
        updated_at,
        prejoin_count,
        adopted_offer_id
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: "Failed to fetch needs" },
        { status: 500 }
      );
    }

    // Transform data for CSV
    const csvData = (needs || []).map(need => ({
      ID: need.id,
      タイトル: need.title,
      概要: need.summary || '',
      予算: need.price,
      最低人数: need.min_people,
      締切: need.deadline,
      ステータス: need.status,
      作成日: new Date(need.created_at).toLocaleDateString('ja-JP'),
      更新日: new Date(need.updated_at).toLocaleDateString('ja-JP'),
      参加予約数: need.prejoin_count || 0,
      採用済み: need.adopted_offer_id ? 'はい' : 'いいえ'
    }));

    const csv = createUTF8BOM() + arrayToCSV(csvData);
    
    const filename = `needs_${new Date().toISOString().split('T')[0]}.csv`;

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit(RATE_LIMITS.ADMIN_NEEDS, exportNeedsHandler);
