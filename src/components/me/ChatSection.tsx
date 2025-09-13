"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UnreadBadge } from "../chat/UnreadBadge";

export function ChatSection() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChats() {
      try {
        const response = await fetch('/api/me/chats');
        if (response.ok) {
          const data = await response.json();
          setChats(data.chats || []);
        }
      } catch (error) {
        console.error('チャット一覧の取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchChats();
  }, []);

  return (
    <section className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">チャット</h2>
        <UnreadBadge />
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
          <p className="text-sm text-slate-600 mt-2">読み込み中...</p>
        </div>
      ) : chats.length > 0 ? (
        <div className="space-y-3">
          {chats.slice(0, 3).map((chat) => (
            <Link
              key={chat.id}
              href={`/chat/${chat.room_id}`}
              className="block p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {chat.need_title || `チャット${chat.id.slice(0, 8)}`}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {chat.last_message_time ? 
                      new Date(chat.last_message_time).toLocaleDateString() : 
                      '最近の活動なし'
                    }
                  </p>
                </div>
                {chat.unread_count > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {chat.unread_count}
                  </span>
                )}
              </div>
            </Link>
          ))}
          
          {chats.length > 3 && (
            <Link 
              href="/me/messages"
              className="block text-center py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              すべてのチャットを表示 ({chats.length}件)
            </Link>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-sm text-slate-500 mb-2">まだチャットがありません</p>
          <p className="text-xs text-slate-400">ニーズへの提案や応募でチャットが始まります</p>
        </div>
      )}
    </section>
  );
}