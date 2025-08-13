import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { jsonOk, jsonError } from "@/lib/api";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const needId = formData.get("needId") as string;

    if (!file) {
      return jsonError("ファイルが選択されていません");
    }

    if (!needId) {
      return jsonError("needIdが必要です");
    }

    if (file.size > MAX_FILE_SIZE) {
      return jsonError(`ファイルサイズは${MAX_FILE_SIZE / 1024 / 1024}MB以下にしてください`);
    }

    const admin = createAdminClient();
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}-${file.name}`;
    const filePath = `needs/${needId}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await admin.storage
      .from("attachments")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return jsonError(`ファイルのアップロードに失敗しました: ${uploadError.message}`);
    }

    // Insert metadata to database
    const { data: attachment, error: dbError } = await (admin as any)
      .from("attachments")
      .insert({
        need_id: needId,
        file_path: filePath,
        file_name: file.name,
        size: file.size,
        content_type: file.type,
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await admin.storage.from("attachments").remove([filePath]);
      return jsonError(`データベースへの保存に失敗しました: ${dbError.message}`);
    }

    return jsonOk({ 
      id: attachment.id,
      fileName: file.name,
      size: file.size,
    });

  } catch (error: any) {
    return jsonError(error?.message ?? "アップロードに失敗しました", 500);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const needId = searchParams.get("needId");

    if (!needId) {
      return jsonError("needIdが必要です");
    }

    const admin = createAdminClient();

    // Get attachments for the need
    const { data: attachments, error } = await admin
      .from("attachments")
      .select("*")
      .eq("need_id", needId)
      .order("created_at", { ascending: false });

    if (error) {
      return jsonError("添付ファイルの取得に失敗しました");
    }

    // Generate signed URLs for each attachment
    const attachmentsWithUrls = await Promise.all(
      (attachments || []).map(async (attachment) => {
        const { data: signedUrl } = await admin.storage
          .from("attachments")
          .createSignedUrl(attachment.file_path, 600); // 10 minutes

        return {
          ...attachment,
          downloadUrl: signedUrl?.signedUrl,
        };
      })
    );

    return jsonOk({ attachments: attachmentsWithUrls });

  } catch (error: any) {
    return jsonError(error?.message ?? "添付ファイルの取得に失敗しました", 500);
  }
}
