#!/usr/bin/env bash
set -euo pipefail
BASE="${1:-https://needport.jp}"
paths=("/" "/needs" "/needs/new" "/me" "/roadmap" "/login" "/vendors/login")
for p in "${paths[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$p" || true)
  printf "%-20s %s\n" "$p" "$code"
done