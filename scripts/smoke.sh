#!/bin/bash

# スモークテストスクリプト
# 主要ページの動作確認（Cookie Jar使用）

set -e

# 固定プレビューURL（環境変数で上書き可能）
BASE_URL="${BASE_URL:-https://needport-preview.genkis-projects-03a72983.vercel.app}"

echo "=== NeedPort Smoke Test ==="
echo "Base URL: $BASE_URL"
echo ""

# Cookie Jarファイルを作成
COOKIE_JAR=".smoke_cookies"
rm -f "$COOKIE_JAR"

echo "=== Basic Page Tests ==="
curl -s -o /dev/null -w "/ %{http_code}\n" "$BASE_URL/"
curl -s -o /dev/null -w "/needs %{http_code}\n" "$BASE_URL/needs"
curl -s -o /dev/null -w "/needs/new %{http_code}\n" "$BASE_URL/needs/new"
curl -s -o /dev/null -w "/kaichu %{http_code}\n" "$BASE_URL/kaichu"
curl -s -o /dev/null -w "/service-overview %{http_code}\n" "$BASE_URL/service-overview"
curl -s -o /dev/null -w "/auth/login %{http_code}\n" "$BASE_URL/auth/login"
curl -s -o /dev/null -w "/auth/register %{http_code}\n" "$BASE_URL/auth/register"
curl -s -o /dev/null -w "/vendor/login %{http_code}\n" "$BASE_URL/vendor/login"
curl -s -o /dev/null -w "/vendor/register %{http_code}\n" "$BASE_URL/vendor/register"
curl -s -o /dev/null -w "/me %{http_code}\n" "$BASE_URL/me"
curl -s -o /dev/null -w "/about %{http_code}\n" "$BASE_URL/about"
curl -s -o /dev/null -w "/legal/terms %{http_code}\n" "$BASE_URL/legal/terms"
curl -s -o /dev/null -w "/legal/privacy %{http_code}\n" "$BASE_URL/legal/privacy"
curl -s -o /dev/null -w "/legal/tokusho %{http_code}\n" "$BASE_URL/legal/tokusho"
echo ""

echo "=== Role-based Tests ==="
echo "Setting role to guest..."
curl -c "$COOKIE_JAR" -b "$COOKIE_JAR" -s -X POST "$BASE_URL/api/dev/session" -H "Content-Type: application/json" -d '{"role":"guest"}' >/dev/null
echo "Testing guest access..."
curl -c "$COOKIE_JAR" -b "$COOKIE_JAR" -s -o /dev/null -w "kaichu-guest:%{http_code}\n" "$BASE_URL/kaichu"
curl -c "$COOKIE_JAR" -b "$COOKIE_JAR" -s -o /dev/null -w "me-guest:%{http_code}\n" "$BASE_URL/me"

echo "Setting role to vendor..."
curl -c "$COOKIE_JAR" -b "$COOKIE_JAR" -s -X POST "$BASE_URL/api/dev/session" -H "Content-Type: application/json" -d '{"role":"vendor"}' >/dev/null
echo "Testing vendor access..."
curl -c "$COOKIE_JAR" -b "$COOKIE_JAR" -s -o /dev/null -w "me-offers-vendor:%{http_code}\n" "$BASE_URL/me?t=offers"
curl -c "$COOKIE_JAR" -b "$COOKIE_JAR" -s -o /dev/null -w "needs-vendor:%{http_code}\n" "$BASE_URL/needs"

echo "Setting role to general..."
curl -c "$COOKIE_JAR" -b "$COOKIE_JAR" -s -X POST "$BASE_URL/api/dev/session" -H "Content-Type: application/json" -d '{"role":"general"}' >/dev/null
echo "Testing general access..."
curl -c "$COOKIE_JAR" -b "$COOKIE_JAR" -s -o /dev/null -w "me-posts-general:%{http_code}\n" "$BASE_URL/me?t=posts"
curl -c "$COOKIE_JAR" -b "$COOKIE_JAR" -s -o /dev/null -w "needs-general:%{http_code}\n" "$BASE_URL/needs"

echo "Setting role to admin..."
curl -c "$COOKIE_JAR" -b "$COOKIE_JAR" -s -X POST "$BASE_URL/api/dev/session" -H "Content-Type: application/json" -d '{"role":"admin"}' >/dev/null
echo "Testing admin access..."
curl -c "$COOKIE_JAR" -b "$COOKIE_JAR" -s -o /dev/null -w "me-admin:%{http_code}\n" "$BASE_URL/me"
curl -c "$COOKIE_JAR" -b "$COOKIE_JAR" -s -o /dev/null -w "needs-admin:%{http_code}\n" "$BASE_URL/needs"
echo ""

echo "=== API Tests ==="
curl -s -o /dev/null -w "api-dev-session:%{http_code}\n" "$BASE_URL/api/dev/session"
curl -s -o /dev/null -w "api-me-deals:%{http_code}\n" "$BASE_URL/api/me/deals"

echo "=== Production API Tests ==="
echo "GET /api/needs"
curl -sS "$BASE_URL/api/needs" | sed -E 's/,"attachments":[^]]*]//g' | head -c 400
echo ""
echo "GET /api/me/deals (要ログイン)"
curl -sS -I "$BASE_URL/api/me/deals" | head -n 1
echo ""

echo "=== Content Tests ==="
echo "Checking for '提案する' button (should appear for vendor/admin):"
curl -c "$COOKIE_JAR" -b "$COOKIE_JAR" -s "$BASE_URL/needs" | grep -o "提案する" | wc -l
echo "Checking for '事業者登録' button (should appear for guest/general):"
curl -c "$COOKIE_JAR" -b "$COOKIE_JAR" -s "$BASE_URL/needs" | grep -o "事業者登録" | wc -l
echo ""

# Cookie Jarファイルを削除
rm -f "$COOKIE_JAR"

echo "=== Smoke Test Complete ==="
