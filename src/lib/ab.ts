// A/B テストユーティリティ（クライアントサイドのみ）

// メモリストレージ（SSR・テスト用フォールバック）
let memStore = new Map<string, string>();

type KV = { getItem: (k: string) => string | null; setItem: (k: string, v: string) => void };

export function variant(name: string, choices: string[] = ['A','B'], storage?: KV) {
  // SSR/テスト時のデフォルトは 'A'
  if (typeof window === 'undefined' && !storage) return choices[0];

  const store: KV = storage
    ?? (typeof window !== 'undefined' && window.localStorage
        ? window.localStorage
        : { getItem: (k) => memStore.get(k) ?? null, setItem: (k,v) => { memStore.set(k, v); } });

  const key = `ab:${name}`;
  let v = store.getItem(key);
  
  if (!v) {
    v = choices[Math.random() < 0.5 ? 0 : 1];
    store.setItem(key, v);
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.debug?.(`[AB] Assigned variant ${v} for ${name}`);
    }
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
