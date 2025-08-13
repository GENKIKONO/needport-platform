// Edge/Node 両対応の nonce 生成ユーティリティ

function bytesToBase64(bytes: Uint8Array): string {
  // Node なら Buffer がある
  // Edge(Runtime) なら btoa を使う
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  // @ts-ignore - btoa は Edge/Browser 環境で存在
  return btoa(bin);
}

export function makeNonce(size = 16): string {
  // Edge/Browser: Web Crypto
  if (globalThis.crypto && "getRandomValues" in globalThis.crypto) {
    const bytes = new Uint8Array(size);
    globalThis.crypto.getRandomValues(bytes);
    return bytesToBase64(bytes);
  }
  // Node: crypto を遅延 import（Edge では実行されない）
  // NOTE: 同期 API が必要な場所では size を固定にして使うこと
  // ここは同期で返したいので Node 環境でのみ到達する前提
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { randomBytes } = require("crypto");
  return randomBytes(size).toString("base64");
}
