#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE:-http://localhost:3000}"
echo "== Smoke on ${BASE} =="

# dev サーバ起動（未起動なら）
if ! curl -sf "${BASE}" >/dev/null 2>&1; then
  echo "Starting dev server..."
  (npm run dev > /tmp/needport-dev.log 2>&1 &)  # バックグラウンド
  for i in {1..40}; do
    sleep 0.5
    if curl -sf "${BASE}" >/dev/null 2>&1; then
      echo "Dev is up"
      break
    fi
    if [ "$i" -eq 40 ]; then
      echo "Dev failed. Tail logs:"
      tail -n 150 /tmp/needport-dev.log || true
      exit 1
    fi
  done
fi

echo "[1] CSP header"
if curl -sI "${BASE}" | grep -qi "content-security-policy"; then
  echo "OK: CSP header present"
else
  echo "NG: CSP header missing"; exit 1
fi

echo "[2] nonce attribute (rough check)"
N=$(curl -s "${BASE}" | grep -o 'nonce="[A-Za-z0-9+/=]\+"' | wc -l | tr -d ' ')
if [ "${N}" -ge 1 ]; then
  echo "OK: nonce count ${N}"
else
  echo "NG: nonce not found"; exit 1
fi

echo "[3] POST /api/needs (personal)"
RES=$(curl -s -X POST "${BASE}/api/needs" \
  -H "Content-Type: application/json" \
  --data-binary '{"title":"Smoke: 個人","summary":"OK","scale":"personal","agree":true}')
echo "→ ${RES}"
echo "${RES}" | grep -q '"ok":true' || { echo "NG (personal)"; exit 1; }

echo "[4] POST /api/needs (community + macro)"
RES=$(curl -s -X POST "${BASE}/api/needs" \
  -H "Content-Type: application/json" \
  --data-binary '{"title":"Smoke: 地域","summary":"OK","scale":"community","macro_fee_hint":"月500円〜","macro_use_freq":"月1回〜","macro_area_hint":"高知県内","agree":true}')
echo "→ ${RES}"
echo "${RES}" | grep -q '"ok":true' || { echo "NG (community)"; exit 1; }

# 任意: CSV チェック（管理認証が必要）
if [ "${CI:-0}" = "1" ]; then
  echo "[5] CSV columns check"
  CSV_OPTS=()
  if [ -n "${ADMIN_COOKIE:-}" ]; then
    CSV_OPTS+=( -H "Cookie: ${ADMIN_COOKIE}" )
  fi
  if curl -fsSL ${CSV_OPTS[@]+"${CSV_OPTS[@]}"} "${BASE}/admin/needs.csv" | head -1 | grep -q '種類,会費目安,利用頻度,対象エリア'; then
    echo "OK: CSV headers exist"
  else
    echo "WARN: CSV check skipped or unauthorized (set ADMIN_COOKIE to enable)"
  fi
fi

echo "🎉 All smoke tests passed. Visit ${BASE}/admin/smoke"
