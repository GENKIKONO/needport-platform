import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from('needs')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete need' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Need deleted successfully' });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}