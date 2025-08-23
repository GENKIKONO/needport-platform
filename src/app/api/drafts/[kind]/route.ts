import { NextRequest, NextResponse } from 'next/server';
import { upsertDraft, getDraft, deleteDraft } from '@/lib/server/drafts';
import { getDevSession } from '@/lib/devAuth';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/drafts/[kind] → 最新ドラフト取得
export async function GET(
  req: NextRequest,
  { params }: { params: { kind: string } }
) {
  try {
    const kind = params.kind as 'need' | 'vendor';
    if (!['need', 'vendor'].includes(kind)) {
      return NextResponse.json({ error: "invalid_kind" }, { status: 400 });
    }

    const devSession = getDevSession();
    const ownerId = devSession?.userId || 'anonymous';

    const draft = await getDraft(kind, ownerId);
    
    if (!draft) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json({
      id: draft.id,
      payload: draft.payload,
      updatedAt: draft.updated_at
    });

  } catch (error) {
    console.error('Get draft error:', error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

// PUT /api/drafts/[kind] → ドラフト保存
export async function PUT(
  req: NextRequest,
  { params }: { params: { kind: string } }
) {
  try {
    const kind = params.kind as 'need' | 'vendor';
    if (!['need', 'vendor'].includes(kind)) {
      return NextResponse.json({ error: "invalid_kind" }, { status: 400 });
    }

    const json = await req.json();
    const { payload } = json;

    if (!payload) {
      return NextResponse.json({ error: "payload_required" }, { status: 400 });
    }

    const devSession = getDevSession();
    const ownerId = devSession?.userId || 'anonymous';

    const draft = await upsertDraft(kind, ownerId, payload);

    return NextResponse.json({
      id: draft.id,
      updatedAt: draft.updated_at
    });

  } catch (error) {
    console.error('Save draft error:', error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

// DELETE /api/drafts/[kind] → ドラフト削除
export async function DELETE(
  req: NextRequest,
  { params }: { params: { kind: string } }
) {
  try {
    const kind = params.kind as 'need' | 'vendor';
    if (!['need', 'vendor'].includes(kind)) {
      return NextResponse.json({ error: "invalid_kind" }, { status: 400 });
    }

    const devSession = getDevSession();
    const ownerId = devSession?.userId || 'anonymous';

    // 既存のドラフトを取得して削除
    const draft = await getDraft(kind, ownerId);
    if (draft) {
      await deleteDraft(draft.id, ownerId);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete draft error:', error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
