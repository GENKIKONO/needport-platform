#!/usr/bin/env bash
set -e
echo "== smoke: /api/ready ==" && curl -s https://needport.jp/api/ready | jq || curl -s https://needport.jp/api/ready
echo "== smoke: sign-in ==" && curl -s -o /dev/null -w "SIGNIN:%{http_code}\n" https://needport.jp/sign-in
echo "== smoke: checkout(payment) ==" && curl -s -X POST https://needport.jp/api/billing/checkout -H 'content-type: application/json' -d '{"mode":"payment"}' ; echo
echo "== smoke: checkout(subscription) ==" && curl -s -X POST https://needport.jp/api/billing/checkout -H 'content-type: application/json' -d '{"mode":"subscription"}' ; echo
echo "== smoke: entitlements ==" && curl -s https://needport.jp/api/me/entitlements ; echo
