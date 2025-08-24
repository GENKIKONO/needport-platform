'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChatRoom } from '@/lib/types/me';
import { events } from '@/lib/events';

export default function ChatHistory({ userId }: { userId: string }){
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/me/chats');
        if (!response.ok) {
          throw new Error('Failed to fetch chat rooms');
        }
        const data = await response.json();
        setRooms(data);
      } catch (err) {
        console.error('Failed to fetch chat rooms:', err);
        setError('読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, [userId]);

  const handleRetry = () => {
    events.track('me.retry', { target: 'chats' });
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">チャット履歴</h2>
        <div className="rounded-md border bg-white p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">チャット履歴</h2>
        <div className="rounded-md border bg-white p-4 text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            再読込
          </button>
        </div>
      </div>
    );
  }

  if (!rooms?.length) {
    return <p className="text-sm text-slate-600">参加中のチャットはまだありません。</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">チャット履歴</h2>
      <ul className="divide-y rounded-md border bg-white">
        {rooms.map((room) => (
          <li key={room.id} className="p-4 hover:bg-slate-50">
            <Link 
              href={`/rooms/${room.id}`} 
              className="block"
              onClick={() => events.track('me.open_chat', { roomId: room.id })}
            >
              <div className="font-medium">{room.title}</div>
              {room.lastMessage && (
                <div className="text-sm text-gray-500 mt-1">{room.lastMessage}</div>
              )}
              <div className="text-xs text-gray-400 mt-1">
                {new Date(room.updatedAt).toLocaleDateString('ja-JP')}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
