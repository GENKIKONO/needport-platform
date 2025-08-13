export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Get latest 50 needs
    const { data: needs, error } = await supabase
      .from("needs")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Failed to fetch needs for JSON Feed:", error);
      return new NextResponse("", { status: 500 });
    }

    const needsList = needs || [];

    const jsonFeed = {
      version: "https://jsonfeed.org/version/1",
      title: "NeedPort - 最新の募集",
      home_page_url: siteUrl,
      feed_url: `${siteUrl}/feeds/needs.json`,
      description: "最新の募集情報をお届けします",
      language: "ja",
      items: needsList.map(need => ({
        id: need.id,
        url: `${siteUrl}/needs/${need.id}`,
        title: need.title,
        date_published: new Date(need.created_at).toISOString(),
      })),
    };

    return NextResponse.json(jsonFeed, {
      headers: {
        "Cache-Control": "public, max-age=300", // 5 minutes cache
      },
    });
  } catch (error) {
    console.error("JSON Feed generation error:", error);
    return new NextResponse("", { status: 500 });
  }
}
