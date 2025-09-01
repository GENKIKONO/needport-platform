#!/usr/bin/env bash
set -euo pipefail
BASE="${1:?Usage: smoke-prod.sh https://your-domain}"
echo "== Smoke @ $BASE =="
curl -fsS "$BASE/v2" >/dev/null && echo "[OK] /v2"
curl -fsS "$BASE/v2/needs" >/dev/null && echo "[OK] /v2/needs"
curl -fsS "$BASE/v2/vendors" >/dev/null && echo "[OK] /v2/vendors"
curl -fsS "$BASE/api/ready" | jq '.prod' && echo "[OK] /api/ready(prod)"
curl -fsS "$BASE/sitemap.xml" >/dev/null && echo "[OK] /sitemap.xml"
curl -fsS "$BASE/robots.txt"  >/dev/null && echo "[OK] /robots.txt"
echo "== done =="
