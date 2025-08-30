import { NextRequest, NextResponse } from 'next/server';
import { createPendingUpload } from '@/lib/server/uploads';
import { getDevSession } from '@/lib/devAuth';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/uploads/pending → 一時アップロード
export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { kind, name, mime, size } = json;

    if (!kind || !name || !mime || !size) {
      return NextResponse.json({ 
        error: "missing_required_fields" 
      }, { status: 400 });
    }

    if (!['need', 'vendor'].includes(kind)) {
      return NextResponse.json({ 
        error: "invalid_kind" 
      }, { status: 400 });
    }

    // ファイルサイズ制限（25MB）
    if (size > 25 * 1024 * 1024) {
      return NextResponse.json({ 
        error: "file_too_large" 
      }, { status: 400 });
    }

    const devSession = getDevSession();
    const ownerId = devSession?.userId || 'anonymous';

    const result = await createPendingUpload(ownerId, kind as 'need' | 'vendor', {
      name,
      mime,
      size
    });

    return NextResponse.json({
      id: result.id,
      fileKey: result.fileKey,
      previewUrl: result.previewUrl,
      mime: result.mime,
      size: result.size
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: "internal_error" 
    }, { status: 500 });
  }
}
