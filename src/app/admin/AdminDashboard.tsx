'use client';

import { useState, useEffect } from 'react';
import { loadProjects, saveProjects } from '@/lib/admin/local-store';
import type { AdminProject, AdminStatus } from '@/lib/types/admin';

const CATEGORIES = ['Web開発', 'モバイルアプリ', 'デザイン', 'マーケティング', 'コンサルティング'];

export default function AdminDashboard() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [newProject, setNewProject] = useState({ title: '', category: '', ownerName: '' });
  const [toast, setToast] = useState('');

  useEffect(() => {
    setProjects(loadProjects());
  }, []);

  const saveAndToast = (newProjects: AdminProject[], message: string) => {
    setProjects(newProjects);
    saveProjects(newProjects);
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const updateProjectStatus = (id: string, status: AdminStatus) => {
    const updated = projects.map(p => 
      p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p
    );
    saveAndToast(updated, `ステータスを ${status} に変更しました (Demo mode only)`);
  };

  const updateProjectCategory = (id: string, category: string) => {
    const updated = projects.map(p => 
      p.id === id ? { ...p, category, updatedAt: new Date().toISOString() } : p
    );
    saveAndToast(updated, `カテゴリを ${category} に変更しました (Demo mode only)`);
  };

  const deleteProject = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    saveAndToast(updated, 'プロジェクトを削除しました (Demo mode only)');
  };

  const addComment = (projectId: string) => {
    if (!newComment.trim()) return;
    
    const updated = projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          comments: [...p.comments, {
            id: `comment-${Date.now()}`,
            author: '管理者',
            body: newComment,
            at: new Date().toISOString()
          }]
        };
      }
      return p;
    });
    
    saveAndToast(updated, 'コメントを追加しました (Demo mode only)');
    setNewComment('');
    setShowComments(null);
  };

  const deleteComment = (projectId: string, commentId: string) => {
    const updated = projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          comments: p.comments.filter(c => c.id !== commentId)
        };
      }
      return p;
    });
    
    saveAndToast(updated, 'コメントを削除しました (Demo mode only)');
  };

  const createNewProject = () => {
    if (!newProject.title || !newProject.category || !newProject.ownerName) return;
    
    const project: AdminProject = {
      id: `demo-${Date.now()}`,
      title: newProject.title,
      ownerName: newProject.ownerName,
      category: newProject.category,
      status: 'demo',
      isDemo: true,
      createdAt: new Date().toISOString(),
      comments: []
    };
    
    const updated = [...projects, project];
    saveAndToast(updated, '新しいデモプロジェクトを作成しました (Demo mode only)');
    setNewProject({ title: '', category: '', ownerName: '' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8" data-testid="admin-dashboard">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Admin Demo Console
        </h1>
        <p className="text-gray-600 mb-4">
          デモ用管理画面です。すべての操作はローカルにのみ保存されます。
        </p>
        
        {/* 新規プロジェクト作成 */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-3">新規デモ作成</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="タイトル"
              value={newProject.title}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              className="px-3 py-2 border rounded"
            />
            <select
              value={newProject.category}
              onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
              className="px-3 py-2 border rounded"
            >
              <option value="">カテゴリ選択</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="オーナー名"
              value={newProject.ownerName}
              onChange={(e) => setNewProject({ ...newProject, ownerName: e.target.value })}
              className="px-3 py-2 border rounded"
            />
            <button
              onClick={createNewProject}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              作成
            </button>
          </div>
        </div>
      </div>

      {/* プロジェクト一覧 */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">タイトル</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">オーナー</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">カテゴリ</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">ステータス</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">更新日</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">アクション</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-t border-gray-100" data-testid="admin-row">
                <td className="px-4 py-3 font-medium text-gray-900">{project.title}</td>
                <td className="px-4 py-3 text-gray-700">{project.ownerName}</td>
                <td className="px-4 py-3 text-gray-700">
                  <select
                    value={project.category || ''}
                    onChange={(e) => updateProjectCategory(project.id, e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                  >
                    <option value="">なし</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  <span className={`px-2 py-1 rounded text-xs ${
                    project.status === 'approved' ? 'bg-green-100 text-green-800' :
                    project.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    project.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {project.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-sm">
                  {project.updatedAt ? formatDate(project.updatedAt) : formatDate(project.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => updateProjectStatus(project.id, 'approved')}
                      className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      data-testid="btn-approve"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateProjectStatus(project.id, 'rejected')}
                      className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      data-testid="btn-reject"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => updateProjectStatus(project.id, 'archived')}
                      className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                      data-testid="btn-archive"
                    >
                      Archive
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="px-2 py-1 bg-red-800 text-white text-xs rounded hover:bg-red-900"
                      data-testid="btn-delete"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setShowComments(showComments === project.id ? null : project.id)}
                      className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      data-testid="btn-comment"
                    >
                      Comments ({project.comments.length})
                    </button>
                  </div>
                  
                  {/* コメントパネル */}
                  {showComments === project.id && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <div className="mb-3">
                        <h4 className="font-medium mb-2">コメント一覧</h4>
                        {project.comments.map((comment) => (
                          <div key={comment.id} className="mb-2 p-2 bg-white rounded border">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-medium text-sm">{comment.author}</span>
                                <span className="text-gray-500 text-xs ml-2">{formatDate(comment.at)}</span>
                              </div>
                              <button
                                onClick={() => deleteComment(project.id, comment.id)}
                                className="text-red-600 text-xs hover:text-red-800"
                              >
                                削除
                              </button>
                            </div>
                            <p className="text-sm mt-1">{comment.body}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="新しいコメント"
                          className="flex-1 px-2 py-1 border rounded text-sm"
                        />
                        <button
                          onClick={() => addComment(project.id)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          追加
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* トースト通知 */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
