"use client";
import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import RoomsJoined from './RoomsJoined';

export const dynamic = 'force-dynamic';

export default function MePage() {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [myNeeds, setMyNeeds] = useState([
    { id: 'need-001', title: '地下室がある家を建てたい', interest_count: 0 },
    { id: 'need-002', title: '手作り家具のワークショップ', interest_count: 2 },
  ]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // 案件ルーム一覧を取得
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
        setLoadingRooms(false);
      }
    };
    
    fetchRooms();
  }, []);

  const handleDelete = async (needId: string, interestCount: number) => {
    if (interestCount > 0) {
      alert('賛同者がいるため削除できません');
      return;
    }
    
    if (!confirm('この投稿を削除しますか？（賛同0件のみ削除可能）')) return;
    
    setDeleting(needId);
    try {
      const r = await fetch(`/api/needs/${needId}/delete-if-clear`, { method: 'POST' });
      
      if (r.status === 204) {
        // 楽観更新: listから除去
        setMyNeeds(prev => prev.filter(n => n.id !== needId));
        alert('削除しました');
      } else if (r.status === 409) {
        alert('賛同者がいるため削除できません');
      } else if (r.status === 501) {
        alert('本番DB接続時のみ削除可能です（環境変数を設定してください）');
      } else if (r.status === 403) {
        alert('この投稿を削除する権限がありません');
      } else {
        alert('削除エラー');
      }
    } catch (error) {
      alert('削除エラー');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <main className="section space-y-6">
      <h1 className="text-2xl font-bold">マイページ</h1>
      
      {/* あなたの案件ルーム */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">あなたの案件ルーム</h2>
        <RoomsJoined />
      </section>
      
      {/* Profile Card */}
      <div className="np-card p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
            デ
          </div>
          <div>
            <h2 className="text-lg font-semibold">デモユーザー</h2>
            <p className="text-sm text-gray-600">東京都渋谷区</p>
            <p className="text-xs text-gray-500">参加日: 2025/8/17</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="np-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">2</div>
          <div className="text-sm text-gray-600">投稿</div>
        </div>
        <div className="np-card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">3</div>
          <div className="text-sm text-gray-600">興味表明</div>
        </div>
        <div className="np-card p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">1</div>
          <div className="text-sm text-gray-600">マッチング</div>
        </div>
      </div>

      {/* My Posts */}
      <div className="np-card p-6">
        <h3 className="font-semibold mb-4">私の投稿</h3>
        <div className="space-y-3">
          {myNeeds.map(need => (
            <div key={need.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium">{need.title}</h4>
                <p className="text-sm text-gray-600">賛同: {need.interest_count}件</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-ghost text-sm"
                  title="編集（近日実装）"
                >
                  編集
                </button>
                <button
                  disabled={need.interest_count > 0 || deleting === need.id}
                  onClick={() => handleDelete(need.id, need.interest_count)}
                  className={`btn text-sm ${
                    need.interest_count > 0 
                      ? 'btn-ghost disabled:opacity-50' 
                      : 'btn-primary'
                  }`}
                  title={
                    need.interest_count > 0 
                      ? '賛同者がいるため削除できません' 
                      : 'この投稿を削除する'
                  }
                >
                  {deleting === need.id ? '削除中...' : '削除'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Your Rooms */}
      {!loadingRooms && rooms.length > 0 && (
        <div className="np-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            あなたの案件ルーム
          </h3>
          <div className="space-y-3">
            {rooms.map((room) => (
              <a 
                key={room.id} 
                href={`/rooms/${room.id}`} 
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="font-medium">{room.title}</div>
                  <div className="text-xs text-neutral-500">
                    role: {room.role === 'buyer' ? '発注者' : room.role === 'vendor' ? '提供者' : '運営'} / 
                    {room.approved ? '承認済み' : '承認待ち'}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  room.approved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {room.approved ? '参加中' : '承認待ち'}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="np-card p-6">
        <h3 className="font-semibold mb-4">クイックアクション</h3>
        <div className="grid gap-3">
          <a href="/post" className="btn btn-primary">新しいニーズを投稿</a>
          <a href="/needs" className="btn btn-ghost">ニーズを探す</a>
        </div>
      </div>
    </main>
  );
}
