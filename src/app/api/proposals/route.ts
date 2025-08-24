import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // ダミー処理（実際には何もしない）
    console.log('Proposal received:', body);
    
    // 常に200を返す
    return NextResponse.json({ 
      success: true, 
      message: '提案を送信しました',
      proposalId: 'proposal_demo_123'
    }, { 
      status: 200,
      headers: { 'cache-control': 'no-store' }
    });
  } catch (error) {
    console.error('Error in proposals API:', error);
    // エラーでも200を返す
    return NextResponse.json({ 
      success: true, 
      message: '提案を送信しました',
      proposalId: 'proposal_demo_123'
    }, { 
      status: 200,
      headers: { 'cache-control': 'no-store' }
    });
  }
}
