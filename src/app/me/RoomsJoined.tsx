'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function RoomsJoined(){
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch('/api/rooms', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setRooms(data.rooms || []);
        }
      } catch (error) {
        console.error('Failed to fetch rooms:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRooms();
  }, []);

  if (loading) {
    return <div className="text-sm text-neutral-500">読み込み中...</div>;
  }

  if (!rooms.length) {
    return <div className="text-sm text-neutral-500">まだ参加中のルームはありません</div>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rooms.map((r: any) => (
        <Link key={r.id} href={`/rooms/${r.id}`} className="np-card p-4 hover:bg-neutral-50">
          <div className="text-sm text-neutral-500">{r.role}・{r.approved ? '承認済み' : '承認待ち'}</div>
          <div className="np-title text-base line-clamp-2 mt-1">{r.title || '案件ルーム'}</div>
        </Link>
      ))}
    </div>
  )
}
