import { NextRequest, NextResponse } from 'next/server';
import { fetchChatRooms } from '@/lib/server/meService';
import { getDevSession } from '@/middleware/session-guard';

export async function GET(request: NextRequest) {
  try {
    const session = getDevSession();
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chatRooms = await fetchChatRooms(session.id);
    return NextResponse.json(chatRooms);
  } catch (error) {
    console.error('Failed to fetch chat rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat rooms' }, 
      { status: 500 }
    );
  }
}
