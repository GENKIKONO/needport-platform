import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = createAdminClient();
    
    // すべてのニーズを削除
    const { error: needsError } = await supabase
      .from('needs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // 存在しないIDで全削除

    if (needsError) {
      console.error('Failed to clear needs:', needsError);
      return NextResponse.json({ error: 'Failed to clear needs' }, { status: 500 });
    }

    // 他のテーブルも必要に応じて削除
    // プロポーザル、支払い履歴など

    return NextResponse.json({ message: 'All data cleared successfully' });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}