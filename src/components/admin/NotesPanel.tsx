'use client';

import { useState, useEffect } from 'react';

interface Note {
  id: string;
  body: string;
  created_at: string;
}

interface NotesPanelProps {
  needId: string;
}

export default function NotesPanel({ needId }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [needId]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/needs/${needId}/notes`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/needs/${needId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: newNote }),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(prev => [data.note, ...prev]);
        setNewNote('');
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-medium mb-4">管理メモ</h3>
      
      {/* Add note form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="メモを入力..."
          className="w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none ring-1 ring-white/10 resize-none"
          rows={3}
          disabled={submitting}
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={!newNote.trim() || submitting}
            className="px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? '追加中...' : '追加'}
          </button>
        </div>
      </form>

      {/* Notes list */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-sm text-gray-400">読み込み中...</div>
        ) : notes.length === 0 ? (
          <div className="text-sm text-gray-400">メモがありません</div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="border-l-2 border-gray-600 pl-3">
              <div className="text-sm whitespace-pre-wrap">{note.body}</div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(note.created_at).toLocaleString('ja-JP')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
