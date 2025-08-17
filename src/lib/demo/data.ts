export interface DemoNeed {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  count: number;
  area: string;
  category: string;
  created_at: string;
}

const demoNeeds: DemoNeed[] = [
  {
    id: 'need-001',
    title: '地下室がある家を建てたい',
    description: '音響設備を完備した地下劇場付きの家を建てたい。防音対策と空調設備も含めて設計をお願いします。',
    progress: 0.85,
    target: 50,
    count: 42,
    area: '高知市',
    category: '住宅・建築',
    created_at: '2024-06-13',
  },
  {
    id: 'need-002',
    title: '自宅にフィンランド式サウナを設置したい',
    description: '薪ストーブ式の本格的なフィンランド式サウナを自宅に設置したい。設計から施工まで一括でお願いします。',
    progress: 0.76,
    target: 30,
    count: 23,
    area: '三戸町',
    category: '住宅・建築',
    created_at: '2024-06-13',
  },
  {
    id: 'need-003',
    title: 'プライベートジェット機内のカスタマイズ',
    description: 'プライベートジェットの内装を完全カスタマイズしたい。高級感のあるデザインで、快適性も重視します。',
    progress: 0.58,
    target: 20,
    count: 12,
    area: '全国対応',
    category: 'モノづくり',
    created_at: '2024-06-13',
  },
  {
    id: 'need-004',
    title: '完全防音のレコーディングスタジオ建設',
    description: 'プロ仕様の完全防音レコーディングスタジオを建設したい。音響設計から機材設置まで含めてお願いします。',
    progress: 0.92,
    target: 40,
    count: 37,
    area: '久万高原町',
    category: 'モノづくり',
    created_at: '2024-06-12',
  },
  {
    id: 'need-005',
    title: '高知駅周辺の固定式ドーム建設',
    description: '高知駅周辺に固定式のドーム施設を建設したい。イベント会場としても使える多目的施設を希望します。',
    progress: 0.62,
    target: 25,
    count: 16,
    area: '高知市',
    category: '住宅・建築',
    created_at: '2024-06-12',
  },
  {
    id: 'need-006',
    title: '地中熱利用の温泉施設',
    description: '地中熱を活用した温泉施設を建設したい。環境に配慮した持続可能な温泉施設を希望します。',
    progress: 0.54,
    target: 35,
    count: 19,
    area: '四万十市',
    category: '健康',
    created_at: '2024-06-11',
  },
];

export async function getNeedsSafe(): Promise<DemoNeed[]> {
  try {
    // 既存のDB取得ロジックがあれば使用（今回はモックのみ）
    return demoNeeds;
  } catch (error) {
    console.warn('Failed to fetch needs from DB, using demo data:', error);
    return demoNeeds;
  }
}

export async function getNeedByIdSafe(id: string): Promise<DemoNeed | null> {
  try {
    const needs = await getNeedsSafe();
    return needs.find(need => need.id === id) || null;
  } catch (error) {
    console.warn('Failed to fetch need by ID, using demo data:', error);
    return demoNeeds.find(need => need.id === id) || null;
  }
}
