// A/B テストユーティリティ（クライアントサイドのみ）

export function variant(name: string, choices: string[] = ['A','B']) {
  if (typeof window === 'undefined') return choices[0];
  
  const key = `ab:${name}`;
  let v = localStorage.getItem(key);
  
  if (!v) {
    v = choices[Math.random() < 0.5 ? 0 : 1];
    localStorage.setItem(key, v);
    console.debug(`[AB] Assigned variant ${v} for ${name}`);
  }
  
  return v;
}

// 決定論的なダミー数生成
export function djb2(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) + s.charCodeAt(i);
  }
  return h >>> 0;
}

export function demoEndorseCount(seed: string) {
  const h = djb2(seed);
  return 3 + (h % 7); // 3..9
}
