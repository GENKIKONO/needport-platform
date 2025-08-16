import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = 'force-dynamic'; // 静的化しない
export const runtime = 'nodejs';        // EdgeではなくNodeで実行
export const revalidate = 0;            // キャッシュ無効

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    const limit = parseInt(searchParams.get("limit") || "20");
    
    if (!query || query.length === 0) {
      return NextResponse.json({ needs: [], total: 0 });
    }
    
    const supabase = createAdminClient();
    
    let needsQuery = supabase
      .from("needs")
      .select("id, title, summary, tags_text, created_at, updated_at, status")
      .eq("status", "published");
    
    // Use FTS for queries with 3+ characters, trigram for shorter queries
    if (query.length >= 3) {
      // Full-text search with ranking
      needsQuery = needsQuery.textSearch("fts_vector", query, {
        type: "websearch",
        config: "japanese"
      });
    } else {
      // Trigram similarity for short queries
      needsQuery = needsQuery.or(`title.ilike.%${query}%,summary.ilike.%${query}%,tags_text.ilike.%${query}%`);
    }
    
    const { data: needs, error } = await needsQuery
      .order("created_at", { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("Search error:", error);
      return NextResponse.json(
        { error: "Search failed" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      needs: needs || [],
      total: needs?.length || 0,
      query,
      searchType: query.length >= 3 ? "fts" : "trigram"
    });
    
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
