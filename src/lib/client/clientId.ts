'use client';

export function getClientId() {
  const KEY = 'np_client_id';
  if (typeof window === 'undefined') return 'server';
  let v = localStorage.getItem(KEY);
  if (!v) {
    // 端末ごとのダミーIDを作成して保存
    v = (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    localStorage.setItem(KEY, `dev-${v}`);
  }
  return localStorage.getItem(KEY)!;
}
