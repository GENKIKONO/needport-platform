'use client';

import { useState, useEffect } from 'react';
import { loadProjects } from '@/lib/admin/local-store';
import { setStatus, setCategory, addComment, deleteComment, setEndorseCount } from '@/lib/admin/mod-overlay';
import { listByNeed, upsert } from '@/lib/proposals/local-store';
import type { AdminProject, AdminStatus } from '@/lib/types/admin';
import type { ProposalDraft } from '@/lib/types/b2b';

const CATEGORIES = ['Web開発', 'モバイルアプリ', 'デザイン', 'マーケティング', 'コンサルティング'];

export default function AdminDashboard() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [newProject, setNewProject] = useState({ title: '', category: '', ownerName: '' });
  const [toast, setToast] = useState('');
  const [endorseCounts, setEndorseCounts] = useState<Record<string, string>>({});
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [proposals, setProposals] = useState<ProposalDraft[]>([]);

  useEffect(() => {
    setProjects(loadProjects());
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const exportData = () => {
    try {
      const modOverlay = localStorage.getItem('admin:mod-overlay:v1');
      const demoProjects = localStorage.getItem('admin:demo-projects');
      
      const exportData = {
        modOverlay: modOverlay ? JSON.parse(modOverlay) : {},
        demoProjects: demoProjects ? JSON.parse(demoProjects) : [],
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `needport-admin-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      showToast('データをエクスポートしました');
    } catch (error) {
      console.warn('Export failed:', error);
      showToast('エクスポートに失敗しました');
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.modOverlay) {
          localStorage.setItem('admin:mod-overlay:v1', JSON.stringify(data.modOverlay));
        }
        if (data.demoProjects) {
          localStorage.setItem('admin:demo-projects', JSON.stringify(data.demoProjects));
        }
        
        setProjects(loadProjects());
        showToast('データをインポートしました');
      } catch (error) {
        console.warn('Import failed:', error);
        showToast('インポートに失敗しました');
      }
    };
    reader.readAsText(file);
  };

  const copyCurl = (project: AdminProject) => {
    const curl = `curl -X POST "$SITE/api/needs" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"${project.title}","description":"${project.ownerName} からの${project.category || 'プロジェクト'}です。","scale":"personal"}'`;
    
    navigator.clipboard.writeText(curl).then(() => {
      showToast('cURLをクリップボードにコピーしました（$SITEを置換してください）');
    }).catch(() => {
      showToast('クリップボードへのコピーに失敗しました');
    });
  };

  const updateEndorseCount = (id: string, value: string) => {
    const num = value === '' ? undefined : parseInt(value, 10);
    if (num !== undefined && (isNaN(num) || num < 0 || num > 999)) return;
    
    setEndorseCount(id, num);
    setEndorseCounts(prev => ({ ...prev, [id]: value }));
    showToast(`賛同数を ${num ?? '自動'} に設定しました`);
  };

  const selectProject = (projectId: string) => {
    setSelectedProject(selectedProject === projectId ? null : projectId);
    if (selectedProject !== projectId) {
      setProposals(listByNeed(projectId));
    }
  };

  const updateProposalStatus = (proposal: ProposalDraft, status: 'approved' | 'rejected') => {
    const updated = { ...proposal, status };
    upsert(updated);
    setProposals(listByNeed(proposal.needId));
    showToast(`提案を${status === 'approved' ? '承認' : '却下'}しました`);
  };

  const toggleProposalFeatured = (proposal: ProposalDraft) => {
    const updated = { ...proposal, featured: !proposal.featured };
    upsert(updated);
    setProposals(listByNeed(proposal.needId));
    showToast(`提案を${updated.featured ? '注目' : '通常'}に設定しました`);
  };

  const resetDemo = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin:mod-overlay:v1');
      localStorage.removeItem('admin:demo-projects');
      localStorage.removeItem('demo:proposals:v1');
      showToast('デモデータをリセットしました');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const seedDemo = () => {
    if (typeof window !== 'undefined') {
      const { seedDemoProjects } = require('@/lib/admin/demo-data');
      const projects = seedDemoProjects();
      localStorage.setItem('admin:demo-projects', JSON.stringify(projects));
      showToast('デモデータを再生成しました');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const saveAndToast = (newProjects: AdminProject[], message: string) => {
    setProjects(newProjects);
    // saveProjects(newProjects); // This line is removed as per the new_code
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const updateProjectStatus = (id: string, status: AdminStatus) => {
    setStatus(id, status);
    const updated = projects.map(p => 
      p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p
    );
    setProjects(updated);
    setToast(`ステータスを ${status} に変更しました (Demo mode only)`);
    setTimeout(() => setToast(''), 3000);
  };

  const updateProjectCategory = (id: string, category: string) => {
    setCategory(id, category);
    const updated = projects.map(p => 
      p.id === id ? { ...p, category, updatedAt: new Date().toISOString() } : p
    );
    setProjects(updated);
    setToast(`カテゴリを ${category} に変更しました (Demo mode only)`);
    setTimeout(() => setToast(''), 3000);
  };

  const deleteProject = (id: string) => {
    setStatus(id, 'archived');
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    setToast('プロジェクトを削除しました (Demo mode only)');
    setTimeout(() => setToast(''), 3000);
  };

  const addCommentToProject = (projectId: string) => {
    if (!newComment.trim()) return;
    
    addComment(projectId, {
      author: '管理者',
      body: newComment
    });
    
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
    
    setProjects(updated);
    setToast('コメントを追加しました (Demo mode only)');
    setNewComment('');
    setShowComments(null);
    setTimeout(() => setToast(''), 3000);
  };

  const deleteCommentFromProject = (projectId: string, commentId: string) => {
    deleteComment(projectId, commentId);
    
    const updated = projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          comments: p.comments.filter(c => c.id !== commentId)
        };
      }
      return p;
    });
    
    setProjects(updated);
    setToast('コメントを削除しました (Demo mode only)');
    setTimeout(() => setToast(''), 3000);
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
        
        {/* フラグ表示 */}
        <div className="text-xs text-gray-500 mb-4" data-testid="flags-indicator">
          B2B: {process.env.EXPERIMENTAL_B2B === '1' ? 'ON' : 'OFF'} | 
          NOINDEX: {process.env.NEXT_PUBLIC_SITE_NOINDEX === '1' ? 'ON' : 'OFF'} | 
          DEMO: {process.env.NEXT_PUBLIC_SHOW_DEMO === '1' ? 'ON' : 'OFF'} | 
          APPROVAL: {process.env.NEXT_PUBLIC_REQUIRE_APPROVAL === '1' ? 'ON' : 'OFF'}
        </div>
        
        <p className="text-gray-600 mb-4">
          デモ用管理画面です。すべての操作はローカルにのみ保存されます。
        </p>
        
        {/* Reset/Seed ボタン */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={resetDemo}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            data-testid="btn-reset-demo"
          >
            Reset Demo
          </button>
          <button
            onClick={seedDemo}
            className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
            data-testid="btn-seed-demo"
          >
            Seed Demo
          </button>
        </div>
        
        {/* Export/Import ボタン */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={exportData}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            Export
          </button>
          <label className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 cursor-pointer">
            Import
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
            />
          </label>
        </div>

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
              <th className="px-4 py-3 text-left font-medium text-gray-700">賛同数</th>
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
                <td className="px-4 py-3 text-gray-700">
                  <input
                    type="number"
                    value={endorseCounts[project.id] || ''}
                    onChange={(e) => updateEndorseCount(project.id, e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                    min="0"
                    max="999"
                  />
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
                    <button
                      onClick={() => copyCurl(project)}
                      className="px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                      data-testid="btn-copy-curl"
                    >
                      cURL
                    </button>
                    <button
                      onClick={() => selectProject(project.id)}
                      className="px-2 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700"
                      data-testid="btn-manage-proposals"
                    >
                      提案管理 ({listByNeed(project.id).length})
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
                                onClick={() => deleteCommentFromProject(project.id, comment.id)}
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
                          onClick={() => addCommentToProject(project.id)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          追加
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 提案管理サブテーブル */}
                  {selectedProject === project.id && proposals.length > 0 && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">提案一覧</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">ベンダー</th>
                              <th className="text-left py-2">価格</th>
                              <th className="text-left py-2">期間</th>
                              <th className="text-left py-2">ステータス</th>
                              <th className="text-left py-2">アクション</th>
                            </tr>
                          </thead>
                          <tbody>
                            {proposals.map((proposal) => (
                              <tr key={proposal.id} className="border-b" data-testid="admin-proposal-row">
                                <td className="py-2">{proposal.vendorName}</td>
                                <td className="py-2">¥{proposal.priceJpy.toLocaleString()}</td>
                                <td className="py-2">{proposal.durationWeeks}週</td>
                                <td className="py-2">
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    proposal.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    proposal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {proposal.status === 'approved' ? '承認済み' :
                                     proposal.status === 'rejected' ? '却下' : '審査中'}
                                  </span>
                                </td>
                                <td className="py-2">
                                  <div className="flex gap-1">
                                    {proposal.status === 'pending' && (
                                      <>
                                        <button
                                          onClick={() => updateProposalStatus(proposal, 'approved')}
                                          className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                          data-testid="btn-prop-approve"
                                        >
                                          承認
                                        </button>
                                        <button
                                          onClick={() => updateProposalStatus(proposal, 'rejected')}
                                          className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                                          data-testid="btn-prop-reject"
                                        >
                                          却下
                                        </button>
                                      </>
                                    )}
                                    {proposal.status === 'approved' && (
                                      <button
                                        onClick={() => toggleProposalFeatured(proposal)}
                                        className={`px-2 py-1 rounded text-xs ${
                                          proposal.featured 
                                            ? 'bg-purple-600 text-white hover:bg-purple-700' 
                                            : 'bg-gray-600 text-white hover:bg-gray-700'
                                        }`}
                                        data-testid="btn-prop-feature"
                                      >
                                        {proposal.featured ? '注目解除' : '注目'}
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
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
