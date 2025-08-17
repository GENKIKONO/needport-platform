"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Message {
  id: string;
  user_ref: string;
  body: string;
  created_at: string;
}

interface Milestone {
  id: string;
  title: string;
  due_date?: string;
  amount_yen?: number;
  status: 'planned' | 'in_progress' | 'done' | 'paid';
}

interface RoomMember {
  user_ref: string;
  role: 'buyer' | 'vendor' | 'ops';
  approved: boolean;
}

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newMilestone, setNewMilestone] = useState({ title: '', due_date: '', amount_yen: '' });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    fetchData();
    // 現在のユーザーを取得
    const handle = document.cookie.split('; ').find(row => row.startsWith('np_user='))?.split('=')[1];
    setCurrentUser(handle || null);
  }, [roomId]);

  const fetchData = async () => {
    try {
      // メッセージ取得
      const messagesRes = await fetch(`/api/rooms/${roomId}/messages`);
      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        setMessages(messagesData.reverse()); // 最新順に表示
      }

      // マイルストーン取得
      const milestonesRes = await fetch(`/api/milestones/${roomId}`);
      if (milestonesRes.ok) {
        const milestonesData = await milestonesRes.json();
        setMilestones(milestonesData);
      }

      // メンバー情報取得（簡易版）
      setMembers([
        { user_ref: 'demo_user', role: 'buyer', approved: true },
        { user_ref: 'vendor_001', role: 'vendor', approved: true },
        { user_ref: 'ops', role: 'ops', approved: true }
      ]);

      // 現在のユーザーの役割と承認状態を設定
      const handle = document.cookie.split('; ').find(row => row.startsWith('np_user='))?.split('=')[1];
      if (handle) {
        const member = members.find(m => m.user_ref === handle);
        if (member) {
          setUserRole(member.role);
          setIsApproved(member.approved);
        }
      }

    } catch (error) {
      console.error('Failed to fetch room data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isApproved) return;

    setSending(true);
    try {
      const response = await fetch(`/api/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newMessage }),
      });

      if (response.status === 201) {
        setNewMessage('');
        fetchData(); // 再取得
      } else if (response.status === 501) {
        alert('本番DB接続時のみメッセージ送信可能です');
      } else if (response.status === 403) {
        alert('承認済みメンバーのみメッセージ送信可能です');
      } else {
        alert('送信エラー');
      }
    } catch (error) {
      alert('送信エラー');
    } finally {
      setSending(false);
    }
  };

  const createMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestone.title.trim()) return;

    try {
      const response = await fetch(`/api/milestones/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newMilestone.title,
          due_date: newMilestone.due_date || null,
          amount_yen: newMilestone.amount_yen ? parseInt(newMilestone.amount_yen) : null,
        }),
      });

      if (response.status === 201) {
        setNewMilestone({ title: '', due_date: '', amount_yen: '' });
        fetchData();
      } else if (response.status === 501) {
        alert('本番DB接続時のみマイルストーン作成可能です');
      } else if (response.status === 403) {
        alert('buyerまたはopsのみマイルストーン作成可能です');
      } else {
        alert('作成エラー');
      }
    } catch (error) {
      alert('作成エラー');
    }
  };

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/pay/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_yen: 10000, // 仮の金額
          room_id: roomId,
        }),
      });

      if (response.status === 200) {
        alert('与信を作成しました（ダミー）');
      } else if (response.status === 501) {
        alert('Stripeが無効です（NEXT_PUBLIC_STRIPE_ENABLED=1で有効化）');
      } else {
        alert('与信作成エラー');
      }
    } catch (error) {
      alert('与信作成エラー');
    }
  };

  if (loading) {
    return (
      <main className="section">
        <div className="np-card p-6 text-center">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メッセージ欄 */}
        <div className="lg:col-span-2">
          <div className="np-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold">メッセージ</h1>
              <div className="flex gap-2">
                {userRole && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {userRole}
                  </span>
                )}
                {isApproved ? (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    承認済み
                  </span>
                ) : (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    承認待ち
                  </span>
                )}
              </div>
            </div>

            {/* メッセージ一覧 */}
            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  まだメッセージはありません
                </div>
              ) : (
                messages.map(message => (
                  <div key={message.id} className="border-l-4 border-blue-500 pl-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{message.user_ref}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleString('ja-JP')}
                      </span>
                    </div>
                    <div className="text-gray-700">{message.body}</div>
                  </div>
                ))
              )}
            </div>

            {/* 送信フォーム */}
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={isApproved ? "メッセージを入力..." : "承認待ちのため送信できません"}
                disabled={!isApproved || sending}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!isApproved || sending || !newMessage.trim()}
                className="btn btn-primary disabled:opacity-50"
              >
                {sending ? '送信中...' : '送信'}
              </button>
            </form>
          </div>
        </div>

        {/* マイルストーン */}
        <div className="lg:col-span-1">
          <div className="np-card p-6">
            <h2 className="text-lg font-semibold mb-4">マイルストーン</h2>
            
            {/* マイルストーン一覧 */}
            <div className="space-y-3 mb-4">
              {milestones.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  まだマイルストーンはありません
                </div>
              ) : (
                milestones.map(milestone => (
                  <div key={milestone.id} className="border border-gray-200 rounded p-3">
                    <div className="font-medium">{milestone.title}</div>
                    {milestone.due_date && (
                      <div className="text-sm text-gray-600">
                        期限: {new Date(milestone.due_date).toLocaleDateString('ja-JP')}
                      </div>
                    )}
                    {milestone.amount_yen && (
                      <div className="text-sm text-gray-600">
                        金額: ¥{milestone.amount_yen.toLocaleString()}
                      </div>
                    )}
                    <div className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded mt-1 inline-block">
                      {milestone.status}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* マイルストーン作成フォーム */}
            {(userRole === 'buyer' || userRole === 'ops') && (
              <form onSubmit={createMilestone} className="space-y-3">
                <input
                  type="text"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="マイルストーン名"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={newMilestone.due_date}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, due_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={newMilestone.amount_yen}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, amount_yen: e.target.value }))}
                  placeholder="金額（円）"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newMilestone.title.trim()}
                  className="btn btn-primary w-full disabled:opacity-50"
                >
                  マイルストーン作成
                </button>
              </form>
            )}

            {/* Stripeボタン */}
            {process.env.NEXT_PUBLIC_STRIPE_ENABLED === '1' && (
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={createPaymentIntent}
                  className="btn btn-secondary w-full"
                >
                  支払い予約を作成
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
