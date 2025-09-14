import { NextRequest, NextResponse } from "next/server";
import { createAdminClientOrNull } from "@/lib/supabase/server";

// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

const sampleNeeds = [
  {
    title: "自宅サウナを設置したい",
    category: "リフォーム",
    region: "港区",
    summary: "自宅の浴室にサウナを設置したく、工事業者を探しています",
    body: "既存の浴室スペースを活用して、家庭用サウナの設置を検討しています。電気工事も含めて対応していただける業者を探しています。予算は200万円程度を想定しています。",
    pii_email: "user1@example.com",
    pii_phone: "090-1234-5678",
    status: "published"
  },
  {
    title: "高齢者向け配食サービスを探している",
    category: "家事支援",
    region: "新宿区",
    summary: "一人暮らしの母のための配食サービスを探しています",
    body: "85歳の母が一人暮らしをしており、栄養バランスの取れた食事の準備が困難になってきました。週3回程度の配食サービスを希望しています。",
    pii_email: "user2@example.com",
    pii_phone: "090-2345-6789",
    status: "published"
  },
  {
    title: "小さな店舗の改装工事",
    category: "リフォーム", 
    region: "渋谷区",
    summary: "20坪程度のカフェの内装リニューアル",
    body: "現在運営しているカフェの内装が古くなり、お客様により良い空間を提供するためにリニューアルを検討しています。木を基調とした温かみのある空間にしたいと考えています。",
    pii_email: "cafe@example.com",
    pii_phone: "03-1234-5678",
    status: "published"
  },
  {
    title: "定期的な庭の手入れ",
    category: "家事支援",
    region: "世田谷区",
    summary: "月2回程度の庭の手入れをお願いしたい",
    body: "庭木の剪定や草むしり、季節の植物の管理などを定期的にお願いしたいと考えています。長期的にお付き合いできる業者を希望しています。",
    pii_email: "garden@example.com",
    pii_phone: "090-3456-7890",
    status: "published"
  },
  {
    title: "ペット同伴可能な引越し業者",
    category: "移動支援",
    region: "目黒区",
    summary: "大型犬と一緒に引越しできる業者を探しています",
    body: "来月引越し予定ですが、大型犬（ゴールデンレトリバー）がいるため、ペット同伴での引越しに慣れている業者を探しています。",
    pii_email: "pet@example.com", 
    pii_phone: "090-4567-8901",
    status: "published"
  }
];

export async function POST() {
  try {
    const supabase = createAdminClientOrNull();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'SERVICE_UNAVAILABLE', detail: 'Admin env not configured' },
        { status: 503 }
      );
    }
    
    // サンプルデータを挿入
    const { data, error } = await supabase
      .from('needs')
      .insert(sampleNeeds.map(need => ({
        ...need,
        creator_id: 'sample-user-id', // 仮のユーザーID
      })))
      .select();

    if (error) {
      console.error('Failed to generate sample data:', error);
      return NextResponse.json({ error: 'Failed to generate sample data' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: `${data?.length || 0} sample needs created successfully`,
      data 
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}