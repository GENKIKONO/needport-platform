#!/usr/bin/env bash
set -e
ORIGIN="${1:-https://needport.jp}"
echo "# smoke: $ORIGIN"
for p in / /v2 /v2/needs /v2/vendors /sitemap.xml /robots.txt ; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$ORIGIN$p")
  echo "$p -> $code"
done
