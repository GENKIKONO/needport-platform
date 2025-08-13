"use client";

import { useState, useEffect } from "react";

interface VendorInvite {
  id: string;
  email: string;
  note: string | null;
  created_at: string;
}

interface VendorInviteFormProps {
  needId: string;
}

export default function VendorInviteForm({ needId }: VendorInviteFormProps) {
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [invites, setInvites] = useState<VendorInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInvites();
  }, [needId]);

  const fetchInvites = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/needs/${needId}/invites`);
      if (response.ok) {
        const data = await response.json();
        setInvites(data.invites || []);
      }
    } catch (error) {
      console.error("Failed to fetch invites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/needs/${needId}/invites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), note: note.trim() }),
      });

      if (response.ok) {
        setEmail("");
        setNote("");
        await fetchInvites();
      } else {
        const error = await response.json();
        alert(error.error || "招待の作成に失敗しました");
      }
    } catch (error) {
      alert("招待の作成に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMailClick = (invite: VendorInvite) => {
    const subject = `NeedPort: 募集案件への参加依頼`;
    const body = `NeedPortの募集案件への参加をご検討いただけますでしょうか。

${note ? `備考: ${invite.note}\n\n` : ""}詳細は以下のURLからご確認いただけます：
${window.location.origin}/needs/${needId}

ご質問やご相談がございましたら、お気軽にお返事ください。

よろしくお願いいたします。`;

    const mailtoUrl = `mailto:${invite.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  return (
    <div className="space-y-4">
      {/* Invite Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vendor@example.com"
            className="w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none ring-1 ring-white/10"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">備考（任意）</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="特別な要件や注意事項があれば記入してください"
            rows={3}
            className="w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none ring-1 ring-white/10"
          />
        </div>
        <button
          type="submit"
          disabled={submitting || !email.trim()}
          className="rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-3 py-2 text-sm text-emerald-200 hover:bg-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "送信中..." : "招待を記録"}
        </button>
      </form>

      {/* Invites List */}
      <div>
        <h4 className="text-sm font-medium mb-2">招待履歴（最新20件）</h4>
        {loading ? (
          <div className="text-sm text-gray-400">読み込み中...</div>
        ) : invites.length === 0 ? (
          <div className="text-sm text-gray-400">招待履歴がありません</div>
        ) : (
          <div className="space-y-2">
            {invites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between p-2 rounded border border-white/10">
                <div className="flex-1">
                  <div className="text-sm font-medium">{invite.email}</div>
                  {invite.note && (
                    <div className="text-xs text-gray-400 mt-1">{invite.note}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(invite.created_at).toLocaleString("ja-JP")}
                  </div>
                </div>
                <button
                  onClick={() => handleMailClick(invite)}
                  className="ml-2 rounded border border-blue-500/40 bg-blue-600/20 px-2 py-1 text-xs text-blue-200 hover:bg-blue-600/30"
                >
                  メールを開く
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
