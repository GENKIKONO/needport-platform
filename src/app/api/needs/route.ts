import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Minimal posting flow: only title + body required
const MinimalNeedInput = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'UNAUTHORIZED',
        detail: 'ログインが必要です。ログインしてから再度お試しください。' 
      }, { status: 401 });
    }

    const json = await req.json().catch(() => ({}));
    
    // Validate minimal input
    const validation = MinimalNeedInput.safeParse(json);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { title, body } = validation.data;
    
    // Use service-role client to bypass RLS
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ 
        error: 'SERVICE_ERROR', 
        detail: 'Admin client unavailable' 
      }, { status: 500 });
    }
    
    // Debug: Check if we're using service role
    console.log('Using service role key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('Clerk userId:', userId);
    
    // First, find the profile ID from clerk_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', userId)
      .single();
    
    if (profileError || !profile) {
      console.error('Profile not found for clerk_id:', userId, profileError);
      return NextResponse.json({ 
        error: 'USER_NOT_FOUND', 
        detail: 'ユーザープロフィールが見つかりません。アカウント設定を確認してください。' 
      }, { status: 400 });
    }
    
    console.log('Found profile id:', profile.id);
    
    // Insert with the actual profile ID as owner_id
    const { data, error } = await supabase
      .from('needs')
      .insert([{ 
        title: title.trim(), 
        body: body.trim(),
        status: 'draft',
        published: false,
        owner_id: profile.id  // Use the profile ID, not clerk ID
      }])
      .select('id, title, created_at')
      .single();

    if (error) {
      return NextResponse.json({ 
        error: 'DB_ERROR', 
        detail: error?.message ?? String(error) 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      id: data.id, 
      title: data.title, 
      created_at: data.created_at 
    }, { status: 201 });

  } catch (e: any) {
    return NextResponse.json({ 
      error: 'INTERNAL_ERROR',
      detail: e?.message ?? String(e)
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ 
        error: 'SERVICE_ERROR', 
        detail: 'Admin client unavailable' 
      }, { status: 500 });
    }
    
    const { data, error } = await supabase
      .from("needs")
      .select("*")
      .eq("published", true)  // Only show published needs
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { 
        status: 500
      });
    }

    return NextResponse.json({ needs: data || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch needs' }, { 
      status: 500
    });
  }
}