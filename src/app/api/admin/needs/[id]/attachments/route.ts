import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/server/supabase';


// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `needs/${id}/${fileName}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file);

    if (uploadError) {
      console.error('[attachments] upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Create signed URL for immediate access
    const { data: signedUrlData } = await supabase.storage
      .from('attachments')
      .createSignedUrl(filePath, 600); // 10 minutes

    // Insert database record
    const { data: attachment, error: dbError } = await supabase
      .from('attachments')
      .insert({
        need_id: id,
        path: filePath,
        name: file.name,
        size: file.size
      })
      .select('id, name, size')
      .single();

    if (dbError) {
      console.error('[attachments] db error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save attachment record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      id: attachment.id,
      name: attachment.name,
      size: attachment.size,
      url: signedUrlData?.signedUrl
    });

  } catch (error) {
    console.error('[attachments] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = supabaseServer();
    
    const { data: attachments, error } = await supabase
      .from('attachments')
      .select('id, name, size, created_at')
      .eq('need_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[attachments] fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch attachments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ attachments: attachments || [] });

  } catch (error) {
    console.error('[attachments] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
