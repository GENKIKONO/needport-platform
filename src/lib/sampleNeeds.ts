export interface SampleNeed {
  id: string;
  title: string;
  description: string;
  category: string;
  area: string;
  targetPeople: number;
  currentPeople: number;
  deadline: string;
  imageUrl?: string;
}

export const sampleNeeds: SampleNeed[] = [
  {
    id: 'need-001',
    title: 'Webサイトリニューアルプロジェクト',
    description: '既存のコーポレートサイトをモダンなデザインに刷新し、ユーザビリティを向上させたい。レスポンシブ対応とSEO対策も含む。',
    category: 'Webデザイン',
    area: '東京都',
    targetPeople: 1,
    currentPeople: 0,
    deadline: '2024-12-31',
  },
  {
    id: 'need-002',
    title: '社内研修プログラム開発',
    description: '新入社員向けのビジネスマナー研修プログラムを開発したい。オンライン対応と実地研修の両方をカバーする。',
    category: '研修',
    area: '全国対応',
    targetPeople: 10,
    currentPeople: 8,
    deadline: '2024-11-30',
  },
  {
    id: 'need-003',
    title: 'ECサイトの決済システム導入',
    description: '既存のECサイトに新しい決済システムを導入したい。複数の決済方法に対応し、セキュリティも強化したい。',
    category: 'システム開発',
    area: '全国対応',
    targetPeople: 1,
    currentPeople: 0,
    deadline: '2024-12-15',
  },
  {
    id: 'need-004',
    title: '動画制作・編集サービス',
    description: '商品紹介動画とSNS用ショート動画の制作をお願いしたい。ブランドイメージに合ったクリエイティブな作品を希望。',
    category: '動画制作',
    area: '関東圏',
    targetPeople: 1,
    currentPeople: 0,
    deadline: '2024-12-20',
  },
  {
    id: 'need-005',
    title: '翻訳・ローカライゼーション',
    description: '英語のマニュアルとWebサイトを日本語に翻訳し、日本市場向けにローカライズしたい。技術文書の専門用語対応も必要。',
    category: '翻訳',
    area: '全国対応',
    targetPeople: 2,
    currentPeople: 1,
    deadline: '2024-12-10',
  },
  {
    id: 'need-006',
    title: 'イベント企画・運営',
    description: '100名規模の技術カンファレンスの企画から運営まで一括でお願いしたい。オンライン・ハイブリッド対応も検討。',
    category: 'イベント',
    area: '東京都',
    targetPeople: 1,
    currentPeople: 0,
    deadline: '2024-12-25',
  },
];

export function getSampleNeeds(): SampleNeed[] {
  return sampleNeeds;
}

export function findSampleNeed(id: string): SampleNeed | undefined {
  return sampleNeeds.find(need => need.id === id);
}
