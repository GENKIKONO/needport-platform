import { redirect } from 'next/navigation';
import { loadProjects } from '@/lib/admin/local-store';
import { isPubliclyVisible } from '@/lib/admin/mod-overlay';
import NeedCard from '@/components/NeedCard';

export default function DemoPage() {
  // フラグチェック
  if (process.env.NEXT_PUBLIC_SHOW_DEMO !== '1') {
    redirect('/');
  }
  
  const projects = loadProjects();
  const visibleProjects = projects.filter(p => isPubliclyVisible(p.id, p.status));
  
  return (
    <div className="container py-8">
      {/* デモ注意バナー */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6" data-testid="banner-demo">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              DEMO MODE
            </h3>
            <div className="mt-1 text-sm text-yellow-700">
              <p>ダミーデータです（検索非公開）</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Demo Projects
        </h1>
        <p className="text-gray-600">
          デモ用プロジェクトの一覧です。実際のプロジェクトではありません。
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleProjects.map((project) => (
          <div key={project.id} className="relative">
            <NeedCard
              need={{
                id: project.id,
                title: project.title,
                summary: `${project.ownerName} からの${project.category || 'プロジェクト'}です。`,
                body: `詳細な要件や仕様については、プロジェクトオーナーの${project.ownerName}にお問い合わせください。`,
                tags: [project.category || 'その他'],
                mode: 'single',
                prejoin_count: 0,
                attachments: [],
                scale: 'personal'
              }}
              adoptedOffer={null}
              membership={{ isGuest: true, isUserMember: false, isProMember: false }}
            />
            <div className="mt-2 text-xs text-gray-500">
              ステータス: {project.status}
            </div>
          </div>
        ))}
      </div>
      
      {visibleProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">デモプロジェクトがありません。</p>
        </div>
      )}
    </div>
  );
}
