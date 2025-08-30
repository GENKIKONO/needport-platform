#!/usr/bin/env bash
set -e
URL="${1:-https://needport.jp}"
echo "==== Smoke @ $URL ===="
echo "# ready"; curl -s "$URL/api/ready" | jq .ok 2>/dev/null || curl -s "$URL/api/ready"
echo "# sign-in"; curl -s -o /dev/null -w "SIGNIN:%{http_code}\n" "$URL/sign-in"
echo "# checkout payment"; curl -s -X POST "$URL/api/billing/checkout" -H 'content-type: application/json' -d '{"mode":"payment"}'
echo "# checkout subscription"; curl -s -X POST "$URL/api/billing/checkout" -H 'content-type: application/json' -d '{"mode":"subscription"}'
echo "==== done ===="
