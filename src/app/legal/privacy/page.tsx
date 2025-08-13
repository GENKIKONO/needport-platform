import MarkdownView, { getMarkdownContent } from '@/components/MarkdownView';

export default function PrivacyPage() {
  const content = getMarkdownContent('privacy.md');
  const lastUpdated = '2024-12-01';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">プライバシーポリシー</h1>
        <p className="text-sm text-gray-400">
          最終更新日: {lastUpdated}
        </p>
      </div>
      
      <div className="bg-zinc-800 rounded-lg p-6">
        <MarkdownView content={content} />
      </div>
    </div>
  );
}
