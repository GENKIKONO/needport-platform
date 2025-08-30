import { z } from 'zod';

export const VendorSchema = z.object({
  // Step 1: 基本情報
  orgType: z.enum(['corporation', 'sole'], {
    errorMap: () => ({ message: '組織形態を選択してください' })
  }),
  companyName: z.string().min(1, '会社名・ブランド名は必須です').max(100, '会社名・ブランド名は100文字以内で入力してください'),
  representative: z.string().optional(),
  prefecture: z.string().min(1, '都道府県を選択してください'),
  city: z.string().min(1, '市区町村を選択してください'),
  phone: z.string().regex(/^(\+81|0)[0-9\-\(\)\s]{9,15}$/, '正しい電話番号を入力してください'),
  
  // Step 2: 事業内容
  categories: z.array(z.string()).min(1, 'カテゴリを1つ以上選択してください').max(5, 'カテゴリは5つまで選択できます'),
  services: z.string().min(10, '事業内容は10文字以上で入力してください').max(1000, '事業内容は1000文字以内で入力してください'),
  regions: z.array(z.string()).min(1, '対応エリアを1つ以上選択してください').max(10, '対応エリアは10個まで選択できます'),
  
  // Step 3: アカウント情報
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください').regex(/^(?=.*[A-Za-z])(?=.*\d)/, '英数字を含めてください'),
  department: z.string().optional(),
  
  // Step 4: ファイル（任意）
  files: z.array(z.object({
    name: z.string(),
    size: z.number(),
    type: z.string(),
    url: z.string().optional()
  })).optional(),
  
  // Step 5: 規約同意
  agreeTerms: z.literal(true, {
    errorMap: () => ({ message: '利用規約への同意は必須です' })
  }),
  agreeNoBypass: z.literal(true, {
    errorMap: () => ({ message: '直取引禁止への同意は必須です' })
  })
});

export type VendorInput = z.infer<typeof VendorSchema>;

// ステップ別バリデーションスキーマ
export const VendorStep1Schema = VendorSchema.pick({
  orgType: true,
  companyName: true,
  representative: true,
  prefecture: true,
  city: true,
  phone: true
});

export const VendorStep2Schema = VendorSchema.pick({
  categories: true,
  services: true,
  regions: true
});

export const VendorStep3Schema = VendorSchema.pick({
  email: true,
  password: true,
  department: true
});

export const VendorStep4Schema = VendorSchema.pick({
  files: true
});

export const VendorStep5Schema = VendorSchema.pick({
  agreeTerms: true,
  agreeNoBypass: true
});

// 都道府県データ
export const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

// カテゴリデータ
export const CATEGORIES = [
  'IT・システム開発', 'Webデザイン', 'マーケティング', '営業・販売',
  'デザイン・クリエイティブ', 'コンサルティング', '教育・研修',
  '製造・ものづくり', '飲食・サービス', 'その他'
];

// 対応エリアデータ
export const REGIONS = [
  '北海道・東北', '関東', '中部', '関西', '中国', '四国', '九州・沖縄',
  '全国対応', 'オンライン対応'
];
