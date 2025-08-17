"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Icon from '@/components/Icon';

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    // 現在のユーザーを取得
    const handle = document.cookie.split('; ').find(row => row.startsWith('np_user='))?.split('=')[1];
    setCurrentUser(handle || null);
  }, [roomId]);

  const fetchData = async () => {
    try {
      setError(null);
      
      // メッセージ取得
      const messagesRes = await fetch(`/api/rooms/${roomId}/messages`);
      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        setMessages(messagesData.reverse()); // 最新順に表示
      } else if (messagesRes.status === 501) {
        setError('本番DB接続時のみ利用可能です');
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
      setError('データの取得に失敗しました');
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
        // メッセージリストを更新
        const newMsg = {
          id: Date.now().toString(),
          user_ref: currentUser || 'unknown',
          body: newMessage,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [newMsg, ...prev]);
      } else if (response.status === 403) {
        alert('承認されていないユーザーはメッセージを送信できません');
      } else if (response.status === 501) {
        alert('本番DB接続時のみ利用可能です');
      } else {
        alert('メッセージの送信に失敗しました');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('メッセージの送信に失敗しました');
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
          amount_yen: newMilestone.amount_yen ? parseInt(newMilestone.amount_yen) : null
        }),
      });

      if (response.status === 201) {
        const milestoneData = await response.json();
        setMilestones(prev => [...prev, {
          id: milestoneData.id,
          title: newMilestone.title,
          due_date: newMilestone.due_date || undefined,
          amount_yen: newMilestone.amount_yen ? parseInt(newMilestone.amount_yen) : undefined,
          status: 'planned'
        }]);
        setNewMilestone({ title: '', due_date: '', amount_yen: '' });
        alert('マイルストーンを作成しました');
      } else if (response.status === 403) {
        alert('マイルストーンの作成権限がありません');
      } else if (response.status === 501) {
        alert('本番DB接続時のみ利用可能です');
      } else {
        alert('マイルストーンの作成に失敗しました');
      }
    } catch (error) {
      console.error('Failed to create milestone:', error);
      alert('マイルストーンの作成に失敗しました');
    }
  };

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/pay/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_yen: 50000,
          room_id: roomId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`支払い予約を作成しました: ${data.id}`);
      } else if (response.status === 501) {
        alert('Stripe機能は現在無効です');
      } else {
        alert('支払い予約の作成に失敗しました');
      }
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      alert('支払い予約の作成に失敗しました');
    }
  };

  if (loading) {
    return (
      <main className="section">
        <div className="text-center py-12">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="section">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">{error}</div>
          <button onClick={fetchData} className="btn btn-primary">再試行</button>
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
              <div className="flex items-center gap-2 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {isApproved ? '承認済み' : '承認待ち'}
                </span>
                {userRole && (
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    {userRole === 'buyer' ? '発注者' : userRole === 'vendor' ? '提供者' : '運営'}
                  </span>
                )}
              </div>
            </div>

            {/* メッセージ一覧 */}
            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Icon name="chat" className="size-8 mx-auto mb-2 text-gray-300" />
                  <p>まだメッセージがありません</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Icon name="user" className="size-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{message.user_ref}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        {message.body}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* メッセージ送信フォーム */}
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={isApproved ? "メッセージを入力..." : "承認待ちのため送信できません"}
                disabled={!isApproved || sending}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
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

        {/* サイドバー */}
        <div className="lg:col-span-1 space-y-6">
          {/* メンバー一覧 */}
          <div className="np-card p-6">
            <h2 className="text-lg font-semibold mb-4">メンバー</h2>
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.user_ref} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="user" className="size-4 text-gray-600" />
                    <span className="text-sm font-medium">{member.user_ref}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      member.role === 'buyer' ? 'bg-blue-100 text-blue-800' :
                      member.role === 'vendor' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {member.role === 'buyer' ? '発注者' : member.role === 'vendor' ? '提供者' : '運営'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      member.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {member.approved ? '承認' : '待ち'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* マイルストーン */}
          <div className="np-card p-6">
            <h2 className="text-lg font-semibold mb-4">マイルストーン</h2>
            
            {/* マイルストーン一覧 */}
            <div className="space-y-3 mb-4">
              {milestones.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  <Icon name="category" className="size-6 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">マイルストーンがありません</p>
                </div>
              ) : (
                milestones.map((milestone) => (
                  <div key={milestone.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="font-medium text-sm mb-1">{milestone.title}</div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      {milestone.due_date && (
                        <span>期限: {milestone.due_date}</span>
                      )}
                      {milestone.amount_yen && (
                        <span>¥{milestone.amount_yen.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        milestone.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                        milestone.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        milestone.status === 'done' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {milestone.status === 'planned' ? '予定' :
                         milestone.status === 'in_progress' ? '進行中' :
                         milestone.status === 'done' ? '完了' : '支払済'}
                      </span>
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
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={newMilestone.due_date}
                    onChange={(e) => setNewMilestone(prev => ({ ...prev, due_date: e.target.value }))}
                    placeholder="期限"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={newMilestone.amount_yen}
                    onChange={(e) => setNewMilestone(prev => ({ ...prev, amount_yen: e.target.value }))}
                    placeholder="金額"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newMilestone.title.trim()}
                  className="btn btn-secondary w-full disabled:opacity-50"
                >
                  マイルストーンを追加
                </button>
              </form>
            )}

            {/* Stripe支払い予約ボタン */}
            {process.env.NEXT_PUBLIC_STRIPE_ENABLED === '1' && (
              <div className="mt-4 pt-4 border-t">
                <button onClick={createPaymentIntent} className="btn btn-secondary w-full">
                  <Icon name="category" className="size-4 mr-2" />
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
