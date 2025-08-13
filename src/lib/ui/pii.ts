/**
 * PII（個人識別情報）を検出して伏字化する関数
 * 簡易的な正規表現による検出
 */
export function piiMask(text: string): string {
  if (!text) return text;
  
  let masked = text;
  
  // メールアドレス
  masked = masked.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '***@***.***');
  
  // 電話番号（日本の形式）
  masked = masked.replace(/(\d{2,4})-(\d{2,4})-(\d{4})/g, '***-***-****');
  masked = masked.replace(/(\d{10,11})/g, '***********');
  
  // URL
  masked = masked.replace(/https?:\/\/[^\s]+/g, '***://***');
  
  // 住所っぽい語（都道府県名）
  const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];
  
  prefectures.forEach(pref => {
    const regex = new RegExp(`${pref}[^\\s]*`, 'g');
    masked = masked.replace(regex, '***');
  });
  
  return masked;
}
