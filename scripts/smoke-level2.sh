#!/usr/bin/env bash
set -euo pipefail
BASE="${1:-https://needport.jp}"

echo "== Level-2 smoke @ $BASE =="
curl -fsS "$BASE/v2" >/dev/null && echo "[OK] /v2"
curl -fsS "$BASE/v2/needs" >/dev/null && echo "[OK] /v2/needs"
curl -fsS "$BASE/v2/vendors" >/dev/null && echo "[OK] /v2/vendors"
curl -fsS "$BASE/api/needs/list?per=1" >/dev/null && echo "[OK] needs API"
curl -fsS "$BASE/api/vendors" >/dev/null && echo "[OK] vendors API"
curl -fsS "$BASE/api/ready" | jq '.seo,.analytics,.notify' && echo "[OK] ready meta"
curl -fsS "$BASE/sitemap.xml" >/dev/null && echo "[OK] sitemap"
curl -fsS "$BASE/robots.txt" >/dev/null && echo "[OK] robots"
echo "== done =="