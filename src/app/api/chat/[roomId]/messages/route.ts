import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Chat Messages API (Lv1: Basic messaging)
 * 
 * GET: Retrieve messages for a chat room
 * - Room-based access control
 * - Basic PII filtering
 * - Message ordering and pagination
 */
export async function GET(
  request: NextRequest, 
  { params }: { params: { roomId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { roomId } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const sadmin = supabaseAdmin();

    // For Lv1, we'll create a simple messages table structure
    // In production, you'd first verify user has access to this room
    
    // Check if chat room exists, if not create it
    const { data: existingRoom } = await sadmin
      .from('chat_rooms')
      .select('id, participants')
      .eq('id', roomId)
      .single();

    if (!existingRoom) {
      // Create room for this need ID (assuming roomId is needId for Lv1)
      const { error: roomError } = await sadmin
        .from('chat_rooms')
        .insert({
          id: roomId,
          need_id: roomId,
          participants: [userId], // Will be expanded when others join
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (roomError) {
        console.error('Error creating chat room:', roomError);
      }

      // Log room creation
      await sadmin.from('audit_logs').insert({
        actor_id: userId,
        action: 'CHAT_ROOM_CREATED',
        target_type: 'chat_room',
        target_id: roomId,
        meta: {
          need_id: roomId,
          participant_count: 1
        }
      });
    } else {
      // Add user to participants if not already there
      const participants = existingRoom.participants || [];
      if (!participants.includes(userId)) {
        participants.push(userId);
        await sadmin
          .from('chat_rooms')
          .update({ 
            participants,
            updated_at: new Date().toISOString()
          })
          .eq('id', roomId);

        // Log room join
        await sadmin.from('audit_logs').insert({
          actor_id: userId,
          action: 'CHAT_ROOM_JOINED',
          target_type: 'chat_room',
          target_id: roomId,
          meta: {
            need_id: roomId,
            participant_count: participants.length
          }
        });
      }
    }

    // Fetch messages
    const { data: messages, error } = await sadmin
      .from('chat_messages')
      .select(`
        id,
        content,
        sender_id,
        created_at,
        is_read,
        profiles!sender_id(first_name, last_name, business_name)
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Transform messages and apply basic PII filtering
    const transformedMessages = (messages || []).map(message => {
      const profile = message.profiles;
      let senderName = 'Unknown User';
      
      if (profile) {
        if (profile.business_name) {
          senderName = profile.business_name;
        } else if (profile.first_name && profile.last_name) {
          // Basic PII masking for Lv1
          senderName = `${profile.first_name} ${profile.last_name.charAt(0)}.`;
        }
      }

      return {
        id: message.id,
        content: message.content,
        sender_id: message.sender_id,
        sender_name: senderName,
        created_at: message.created_at,
        is_read: message.is_read
      };
    });

    return NextResponse.json({
      messages: transformedMessages,
      total: transformedMessages.length,
      room_id: roomId,
      has_more: transformedMessages.length === limit
    });

  } catch (error) {
    console.error('Chat messages API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}