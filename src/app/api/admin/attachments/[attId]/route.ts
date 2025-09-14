import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/server/supabase';


// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attId: string }> }
) {
  try {
    const { attId } = await params;
    const supabase = supabaseServer();
    
    // Get attachment record
    const { data: attachment, error } = await supabase
      .from('attachments')
      .select('path, name')
      .eq('id', attId)
      .single();

    if (error || !attachment) {
      return NextResponse.json(
        { error: 'Attachment not found' },
        { status: 404 }
      );
    }

    // Create signed URL (2 minutes)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('attachments')
      .createSignedUrl(attachment.path, 120);

    if (urlError || !signedUrlData?.signedUrl) {
      console.error('[attachments] signed url error:', urlError);
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 }
      );
    }

    // Redirect to signed URL
    return NextResponse.redirect(signedUrlData.signedUrl, 302);

  } catch (error) {
    console.error('[attachments] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
