import { NextRequest, NextResponse } from 'next/server';
import { VendorSchema } from '@/lib/validation/vendor';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/vendors → 事業者登録
export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = VendorSchema.safeParse(json);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: "validation", 
        issues: parsed.error.flatten() 
      }, { status: 400 });
    }

    const data = parsed.data;
    
    // TODO: 実際のDB保存処理
    // 現在はダミー実装
    console.log('Vendor registration:', data);
    
    return NextResponse.json({ 
      ok: true, 
      message: '登録を受け付けました（審査中）' 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Vendor registration error:', error);
    return NextResponse.json({ 
      error: "internal_error" 
    }, { status: 500 });
  }
}
