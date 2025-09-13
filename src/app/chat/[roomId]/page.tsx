import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ChatRoom } from "@/components/chat/ChatRoom";

export const metadata: Metadata = {
  title: "チャット | NeedPort",
  description: "依頼者と事業者の1:1チャット機能 (Lv1)",
};

/**
 * Chat Room Page - Lv1 Implementation
 * 
 * Features:
 * - 1:1 messaging between requester and vendor
 * - SSE/polling for real-time updates
 * - Basic PII filtering
 * - Audit logging for all messages
 */
export default async function ChatRoomPage({ params }: { params: { roomId: string } }) {
  const { userId } = auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  const { roomId } = params;

  return (
    <div className="mx-auto max-w-4xl h-[calc(100vh-4rem)] flex flex-col">
      {/* Chat Header */}
      <div className="border-b bg-white p-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">チャット: {roomId}</h1>
          <p className="text-sm text-slate-600">
            依頼者↔事業者の1:1チャット (Lv1: 基本機能)
          </p>
        </div>
        <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded border border-amber-200">
          ⚠️ メッセージは監査ログに記録されます
        </div>
      </div>

      {/* Chat Room Component */}
      <ChatRoom roomId={roomId} userId={userId} />
      
      {/* Back Link */}
      <div className="border-t bg-white p-4 text-center">
        <a 
          href={`/needs/${roomId}`} 
          className="text-sky-700 hover:text-sky-800 underline text-sm"
        >
          ← ニーズ詳細に戻る
        </a>
      </div>
    </div>
  );
}
