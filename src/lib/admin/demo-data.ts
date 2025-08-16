import { djb2 } from '../ab';
import type { AdminProject, AdminStatus } from '../types/admin';

const DEMO_CATEGORIES = ['Web開発', 'モバイルアプリ', 'デザイン', 'マーケティング', 'コンサルティング'];
const DEMO_OWNERS = ['田中太郎', '佐藤花子', '鈴木一郎', '高橋美咲', '渡辺健太'];
const DEMO_TITLES = [
  'ECサイトのリニューアル',
  'スマホアプリ開発',
  'ブランドロゴデザイン',
  'SNSマーケティング戦略',
  '業務効率化コンサル',
  'Webサイト制作',
  'UI/UX改善',
  'SEO対策',
  '動画制作',
  'システム導入支援'
];

export function seedDemoProjects(n = 5): AdminProject[] {
  const base = djb2('demo-seed') % 1000;
  const projects: AdminProject[] = [];
  
  for (let i = 0; i < n; i++) {
    const titleIndex = (base + i * 73) % DEMO_TITLES.length;
    const ownerIndex = (base + i * 137) % DEMO_OWNERS.length;
    const categoryIndex = (base + i * 211) % DEMO_CATEGORIES.length;
    const statusIndex = (base + i * 307) % 5;
    
    const statuses: AdminStatus[] = ['demo', 'pending', 'approved', 'rejected', 'archived'];
    const status = statuses[statusIndex];
    
    const createdAt = new Date(Date.now() - ((base + i) % 30) * 864e5).toISOString();
    const updatedAt = status !== 'demo' ? new Date(Date.now() - ((base + i) % 7) * 864e5).toISOString() : undefined;
    
    projects.push({
      id: `demo-${base + i}`,
      title: DEMO_TITLES[titleIndex],
      ownerName: DEMO_OWNERS[ownerIndex],
      category: DEMO_CATEGORIES[categoryIndex],
      status,
      isDemo: true,
      createdAt,
      updatedAt,
      comments: status === 'pending' ? [
        {
          id: `comment-${base + i}-1`,
          author: '管理者',
          body: '詳細な要件を確認させてください',
          at: new Date(Date.now() - ((base + i) % 3) * 864e5).toISOString()
        }
      ] : []
    });
  }
  
  return projects;
}

export function demoIds(): string[] {
  return seedDemoProjects().map(p => p.id);
}
