#!/usr/bin/env bash
set -euo pipefail
BASE="${1:?Usage: smoke-prod.sh https://your-domain}"
echo "== Smoke @ $BASE =="
curl -fsS "$BASE" -o /dev/null && echo "[OK] / (redirect->/v2 expected)"
curl -fsS "$BASE/v2" -o /dev/null && echo "[OK] /v2"
curl -fsS "$BASE/v2/needs" -o /dev/null && echo "[OK] /v2/needs"
curl -fsS "$BASE/v2/vendors" -o /dev/null && echo "[OK] /v2/vendors"
curl -fsS "$BASE/api/ready" | (command -v jq >/dev/null && jq '.prod,.runtime' || cat) && echo "[OK] /api/ready"
curl -fsS "$BASE/sitemap.xml" -o /dev/null && echo "[OK] /sitemap.xml"
curl -fsS "$BASE/robots.txt"  -o /dev/null && echo "[OK] /robots.txt"
echo "== done =="
