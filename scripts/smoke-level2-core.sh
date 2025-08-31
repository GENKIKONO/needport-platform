#!/usr/bin/env bash
set -euo pipefail

host="${1:-https://needport.jp}"

echo "== READY ==" && curl -s "$host/api/ready" | jq '.ok,.checks,.meta' || curl -s "$host/api/ready"

echo "== NEEDS API cap test ==" && curl -s "$host/api/needs/list?per=200" | jq '.rows|length,.total' || true

echo "== Admin CSV (browser only) =="
echo "Open in browser: $host/api/settlements/export"

echo "== Bank create (dry run note) =="
echo "Use browser with Clerk login: POST $host/api/settlements/bank {needId, vendorId, finalPrice, feeRate}"
