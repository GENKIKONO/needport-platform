#!/usr/bin/env bash
set -euo pipefail
BASE="${1:-https://needport.jp}"
paths=("/" "/needs" "/needs/new" "/me" "/roadmap" "/login" "/vendors/login")

# API endpoints for smoke testing
api_paths=("/api/needs" "/api/proposals/create" "/api/checkout/deposit" "/api/webhooks/stripe")

echo "=== Frontend Pages ==="
for p in "${paths[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$p" || true)
  printf "%-20s %s\n" "$p" "$code"
done

echo ""
echo "=== API Endpoints ==="
for p in "${api_paths[@]}"; do
  # GET requests for API endpoints
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$p" || true)
  printf "%-30s %s\n" "$p" "$code"
done