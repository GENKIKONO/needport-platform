"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name?: string;
  created_at: string;
  is_read: boolean;
}

interface ChatRoomProps {
  roomId: string;
  userId: string;
}

export function ChatRoom({ roomId, userId }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages on mount and set up polling
  useEffect(() => {
    loadMessages();
    
    // Set up polling every 3 seconds for Lv1
    const interval = setInterval(loadMessages, 3000);
    
    return () => clearInterval(interval);
  }, [roomId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/chat/${roomId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setError(null);
      } else {
        console.error('Failed to load messages');
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('メッセージの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    setSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/chat/${roomId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage.trim(),
        }),
      });

      if (response.ok) {
        setNewMessage("");
        // Reload messages to show the new one
        await loadMessages();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'メッセージの送信に失敗しました');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('メッセージの送信に失敗しました');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">チャットルームを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-slate-500 text-sm">
              <p className="mb-2">📱 チャットルームが開始されました</p>
              <p>メッセージを送信して会話を始めましょう</p>
              <div className="mt-4 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3 max-w-md mx-auto">
                <p className="font-semibold mb-1">Lv1ポリシー:</p>
                <p>• メッセージは監査ログに記録されます</p>
                <p>• 個人情報の送信にご注意ください</p>
                <p>• 3秒間隔でポーリング更新</p>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === userId;
            return (
              <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwn 
                    ? 'bg-sky-600 text-white' 
                    : 'bg-white border border-slate-200'
                }`}>
                  {!isOwn && message.sender_name && (
                    <div className="text-xs text-slate-500 mb-1">
                      {message.sender_name}
                    </div>
                  )}
                  <div className="break-words">
                    {message.content}
                  </div>
                  <div className={`text-xs mt-1 ${
                    isOwn ? 'text-sky-100' : 'text-slate-400'
                  }`}>
                    {formatTime(message.created_at)}
                    {isOwn && (
                      <span className="ml-1">
                        {message.is_read ? '既読' : '未読'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-t border-red-200 p-3">
          <div className="text-red-800 text-sm">
            ❌ {error}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white border-t p-4">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            disabled={sending}
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                送信中
              </>
            ) : (
              '送信'
            )}
          </button>
        </form>
        <div className="text-xs text-slate-500 mt-2">
          💡 Lv1: 3秒間隔で自動更新 | 最大1000文字
        </div>
      </div>
    </div>
  );
}