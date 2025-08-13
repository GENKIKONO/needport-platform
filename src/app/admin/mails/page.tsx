"use client";

import { useState, useEffect } from "react";
import AdminBar from "@/components/admin/AdminBar";

interface MailTemplate {
  name: string;
  subject: string;
  html: string;
  created_at: string;
  updated_at: string;
}

export default function MailTemplatesPage() {
  const [templates, setTemplates] = useState<MailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MailTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<MailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/mail-templates");
      if (!response.ok) throw new Error("Failed to fetch templates");
      
      const data = await response.json();
      setTemplates(data.templates);
      if (data.templates.length > 0) {
        setSelectedTemplate(data.templates[0]);
        setEditingTemplate({ ...data.templates[0] });
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: MailTemplate) => {
    setSelectedTemplate(template);
    setEditingTemplate({ ...template });
    setPreviewHtml("");
  };

  const handleSave = async () => {
    if (!editingTemplate) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/mail-templates/${editingTemplate.name}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: editingTemplate.subject,
          html: editingTemplate.html
        })
      });

      if (!response.ok) throw new Error("Failed to save template");

      await fetchTemplates();
      setSelectedTemplate(editingTemplate);
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (!editingTemplate) return;
    
    // Simple variable replacement for preview
    let html = editingTemplate.html;
    html = html.replace(/\{\{title\}\}/g, "プレビュー用タイトル");
    html = html.replace(/\{\{message\}\}/g, "プレビュー用メッセージ");
    html = html.replace(/\{\{name\}\}/g, "プレビュー用名前");
    html = html.replace(/\{\{email\}\}/g, "preview@example.com");
    
    setPreviewHtml(html);
  };

  const handleTestSend = async () => {
    if (!editingTemplate) return;

    try {
      setSending(true);
      const response = await fetch(`/api/admin/mail-templates/${editingTemplate.name}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: editingTemplate.subject,
          html: editingTemplate.html
        })
      });

      if (!response.ok) throw new Error("Failed to send test email");

      alert("テストメールを送信しました");
    } catch (error) {
      console.error("Error sending test email:", error);
      alert("テストメールの送信に失敗しました");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminBar />
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminBar />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">メールテンプレート管理</h1>
          <p className="text-gray-600">メールテンプレートの編集、プレビュー、テスト送信ができます</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">テンプレート一覧</h2>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => handleTemplateSelect(template)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedTemplate?.name === template.name
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-medium text-gray-900">{template.name}</div>
                    <div className="text-sm text-gray-500 truncate">{template.subject}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">編集</h2>
            </div>
            <div className="p-4 space-y-4">
              {editingTemplate ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      件名
                    </label>
                    <input
                      type="text"
                      value={editingTemplate.subject}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        subject: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      HTML
                    </label>
                    <textarea
                      value={editingTemplate.html}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        html: e.target.value
                      })}
                      rows={15}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="HTMLテンプレートを入力してください..."
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium"
                    >
                      {saving ? "保存中..." : "保存"}
                    </button>
                    <button
                      onClick={handlePreview}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium"
                    >
                      プレビュー
                    </button>
                    <button
                      onClick={handleTestSend}
                      disabled={sending}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md font-medium"
                    >
                      {sending ? "送信中..." : "テスト送信"}
                    </button>
                  </div>

                  <div className="text-xs text-gray-500">
                    <p>利用可能な変数:</p>
                    <ul className="list-disc list-inside mt-1">
                      <li>{"{{title}}"} - タイトル</li>
                      <li>{"{{message}}"} - メッセージ</li>
                      <li>{"{{name}}"} - 名前</li>
                      <li>{"{{email}}"} - メールアドレス</li>
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  テンプレートを選択してください
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">プレビュー</h2>
            </div>
            <div className="p-4">
              {previewHtml ? (
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  プレビューを表示するには「プレビュー」ボタンをクリックしてください
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
