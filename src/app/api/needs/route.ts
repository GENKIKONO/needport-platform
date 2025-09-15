import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ensureProfile } from '@/lib/ensureProfile';

// Minimal posting flow: only title + body required
const MinimalNeedInput = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
});

export async function POST(req: NextRequest) {
  try {
    // Clerkのユーザー情報を取得
    const user = await currentUser();
    
    if (!user) {
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
    
    // プロフィールを自動作成/確保
    const profileId = await ensureProfile({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || null,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null
    });
    
    console.log('Profile ID ensured:', profileId, 'for Clerk user:', user.id);
    
    // Insert with the profile ID as owner_id
    const { data, error } = await supabase
      .from('needs')
      .insert([{ 
        title: title.trim(), 
        body: body.trim(),
        status: 'draft',
        published: false,
        owner_id: profileId
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