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
    <div className="container mx-auto px-4 py-8">
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
