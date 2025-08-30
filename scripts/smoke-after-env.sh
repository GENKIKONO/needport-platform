#!/usr/bin/env bash
set -e
echo "# Readiness"; curl -s https://needport.jp/api/ready | jq
echo "# Sign-in";  curl -s -o /dev/null -w "SIGNIN:%{http_code}\n" https://needport.jp/sign-in
echo "# Checkout(payment)"; curl -s -X POST https://needport.jp/api/billing/checkout -H 'content-type: application/json' -d '{"mode":"payment"}'
echo "# Checkout(subscription)"; curl -s -X POST https://needport.jp/api/billing/checkout -H 'content-type: application/json' -d '{"mode":"subscription"}'
