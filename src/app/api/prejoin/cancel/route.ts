import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { needId } = await req.json();

    if (!needId) {
      return NextResponse.json(
        { error: 'Need ID is required' },
        { status: 400 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check if prejoin exists
    const { data: prejoin, error: prejoinError } = await supabase
      .from('prejoins')
      .select('id, status')
      .eq('user_id', profile.id)
      .eq('need_id', needId)
      .single();

    if (prejoinError || !prejoin) {
      return NextResponse.json(
        { error: 'Prejoin not found' },
        { status: 404 }
      );
    }

    if (prejoin.status === 'canceled') {
      return NextResponse.json(
        { error: 'Prejoin already canceled' },
        { status: 400 }
      );
    }

    // Cancel prejoin (delete the record to trigger count update)
    const { error: deleteError } = await supabase
      .from('prejoins')
      .delete()
      .eq('id', prejoin.id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to cancel prejoin' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Prejoin canceled successfully',
    });
  } catch (error) {
    console.error('Prejoin cancel error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
