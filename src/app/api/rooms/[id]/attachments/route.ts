import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg'];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    
    // Check if room exists
    const supabase = createAdminClient();
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id')
      .eq('id', roomId)
      .single();
    
    if (roomError || !room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PDF, PNG, JPG" },
        { status: 400 }
      );
    }

    // Validate file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
    if (!hasValidExtension) {
      return NextResponse.json(
        { error: "Invalid file extension" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileId = randomUUID();
    const fileExtension = fileName.split('.').pop();
    const storagePath = `attachments/${roomId}/${fileId}.${fileExtension}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Create signed URL for immediate access
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('attachments')
      .createSignedUrl(storagePath, 3600); // 1 hour

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError);
      return NextResponse.json(
        { error: "Failed to generate access URL" },
        { status: 500 }
      );
    }

    // Store attachment metadata in database
    const attachmentData = {
      id: fileId,
      room_id: roomId,
      original_name: file.name,
      file_path: storagePath,
      file_size: file.size,
      mime_type: file.type,
      uploaded_at: new Date().toISOString()
    };

    const { data: dbData, error: dbError } = await supabase
      .from('room_attachments')
      .insert(attachmentData)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('attachments')
        .remove([storagePath]);
      
      return NextResponse.json(
        { error: "Failed to save attachment metadata" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      attachment: {
        id: fileId,
        originalName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: attachmentData.uploaded_at,
        signedUrl: signedUrlData.signedUrl
      }
    });

  } catch (error) {
    console.error('Attachment upload error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const supabase = createAdminClient();

    // Get attachments for the room
    const { data: attachments, error } = await supabase
      .from('room_attachments')
      .select('*')
      .eq('room_id', roomId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: "Failed to fetch attachments" },
        { status: 500 }
      );
    }

    // Generate signed URLs for each attachment
    const attachmentsWithUrls = await Promise.all(
      (attachments || []).map(async (attachment) => {
        const { data: signedUrlData } = await supabase.storage
          .from('attachments')
          .createSignedUrl(attachment.file_path, 3600); // 1 hour

        return {
          id: attachment.id,
          originalName: attachment.original_name,
          fileSize: attachment.file_size,
          mimeType: attachment.mime_type,
          uploadedAt: attachment.uploaded_at,
          signedUrl: signedUrlData?.signedUrl || null
        };
      })
    );

    return NextResponse.json({
      attachments: attachmentsWithUrls
    });

  } catch (error) {
    console.error('Attachment fetch error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
