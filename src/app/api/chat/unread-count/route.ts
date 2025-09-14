import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

/**
 * Chat Unread Count API (Lv1: Simple badge count)
 * 
 * GET: Get unread message count for current user
 * - Returns total unread count across all rooms
 * - Simple implementation for Lv1
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const sadmin = supabaseAdmin();

    // Get rooms where user is a participant
    const { data: userRooms } = await sadmin
      .from('chat_rooms')
      .select('id')
      .contains('participants', [userId]);

    if (!userRooms || userRooms.length === 0) {
      return NextResponse.json({
        unread_count: 0,
        rooms: []
      });
    }

    const roomIds = userRooms.map(room => room.id);

    // Count unread messages in these rooms (not sent by current user)
    const { count, error } = await sadmin
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .in('room_id', roomIds)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error counting unread messages:', error);
      return NextResponse.json(
        { error: 'Failed to count unread messages' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      unread_count: count || 0,
      rooms: roomIds,
      user_id: userId
    });

  } catch (error) {
    console.error('Unread count API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}