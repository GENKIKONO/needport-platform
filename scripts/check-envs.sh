#!/usr/bin/env bash
set -e
URL="${1:-https://needport.jp}"
echo "== GET $URL/api/ready =="
RESP="$(curl -s "$URL/api/ready" || true)"
echo "$RESP" | jq . 2>/dev/null || echo "$RESP"
echo
echo "== Missing keys =="
echo "$RESP" | jq -r '.missing[]?' 2>/dev/null || echo "(ready API が古い/到達不可)"
