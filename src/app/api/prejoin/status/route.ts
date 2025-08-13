import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const needId = searchParams.get('needId');

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

    // Check prejoin status
    const { data: prejoin, error: prejoinError } = await supabase
      .from('prejoins')
      .select('id, status, created_at')
      .eq('user_id', profile.id)
      .eq('need_id', needId)
      .single();

    if (prejoinError && prejoinError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Failed to check prejoin status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hasPrejoined: !!prejoin,
      status: prejoin?.status || null,
      createdAt: prejoin?.created_at || null,
    });
  } catch (error) {
    console.error('Prejoin status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
