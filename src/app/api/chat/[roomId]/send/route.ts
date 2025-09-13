import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { emailService } from '@/lib/notifications/email';

/**
 * Chat Send Message API (Lv1: Text only)
 * 
 * POST: Send a message to a chat room
 * - Text messages only (no files/images in Lv1)
 * - Basic content filtering
 * - Audit logging for all messages
 */
export async function POST(
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
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Lv1: Basic content validation
    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    if (trimmedContent.length > 1000) {
      return NextResponse.json(
        { error: 'Message too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    // Lv1: Basic PII filtering (simple keyword detection)
    const piiKeywords = [
      '携帯', '電話番号', 'TEL', 'tel', 
      '住所', '〒', '郵便番号',
      'メール', 'email', '@',
      'クレジット', 'カード番号', '口座番号'
    ];
    
    const containsPII = piiKeywords.some(keyword => 
      trimmedContent.includes(keyword)
    );

    const sadmin = supabaseAdmin();

    // Verify user has access to this room
    const { data: room } = await sadmin
      .from('chat_rooms')
      .select('id, participants')
      .eq('id', roomId)
      .single();

    if (!room) {
      return NextResponse.json(
        { error: 'Chat room not found' },
        { status: 404 }
      );
    }

    if (!room.participants?.includes(userId)) {
      return NextResponse.json(
        { error: 'Access denied to this chat room' },
        { status: 403 }
      );
    }

    // Create message
    const messageId = crypto.randomUUID();
    const { error: messageError } = await sadmin
      .from('chat_messages')
      .insert({
        id: messageId,
        room_id: roomId,
        sender_id: userId,
        content: trimmedContent,
        created_at: new Date().toISOString(),
        is_read: false,
        contains_pii: containsPII
      });

    if (messageError) {
      console.error('Error creating message:', messageError);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    // Update room last activity
    await sadmin
      .from('chat_rooms')
      .update({ 
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString()
      })
      .eq('id', roomId);

    // Audit log
    await sadmin.from('audit_logs').insert({
      actor_id: userId,
      action: 'CHAT_MESSAGE_SENT',
      target_type: 'chat_message',
      target_id: messageId,
      meta: {
        room_id: roomId,
        content_length: trimmedContent.length,
        contains_pii: containsPII,
        message_type: 'text'
      }
    });

    // Send email notification to other participants (Lv1: Basic implementation)
    try {
      // Get room participants and sender info
      const otherParticipants = room.participants?.filter(id => id !== userId) || [];
      
      if (otherParticipants.length > 0) {
        // Get sender and need info for email
        const { data: senderProfile } = await sadmin
          .from('profiles')
          .select('first_name, last_name, business_name, email')
          .eq('id', userId)
          .single();

        const { data: needInfo } = await sadmin
          .from('needs')
          .select('title')
          .eq('id', roomId)
          .single();

        if (senderProfile && needInfo) {
          const senderName = senderProfile.business_name || 
                            (senderProfile.first_name && senderProfile.last_name ? 
                             `${senderProfile.first_name} ${senderProfile.last_name}` : 'Unknown User');
          
          // Get recipient emails
          const { data: recipientProfiles } = await sadmin
            .from('profiles')
            .select('email')
            .in('id', otherParticipants);

          // Send notifications to all recipients
          for (const recipient of recipientProfiles || []) {
            if (recipient.email) {
              await emailService.sendMessageNotification(recipient.email, {
                senderName,
                needTitle: needInfo.title,
                messagePreview: trimmedContent.length > 100 ? 
                              `${trimmedContent.substring(0, 100)}...` : 
                              trimmedContent,
                roomId
              });
            }
          }
        }
      }
    } catch (emailError) {
      // Don't fail the message send if email fails
      console.error('Failed to send email notification:', emailError);
    }

    return NextResponse.json({
      message_id: messageId,
      room_id: roomId,
      sent_at: new Date().toISOString(),
      contains_pii: containsPII,
      warning: containsPII ? 'このメッセージには個人情報が含まれている可能性があります' : null
    });

  } catch (error) {
    console.error('Chat send API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}