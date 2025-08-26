#!/bin/bash

# NeedPort Platform - External Preview Deployment
# This script deploys the platform for external preview access

set -e

echo "🚀 NeedPort Platform - External Preview Deployment"
echo "=================================================="

# Check if VERCEL_TOKEN is set
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Error: VERCEL_TOKEN environment variable is not set"
    echo "Please set VERCEL_TOKEN in your environment:"
    echo "export VERCEL_TOKEN='your_vercel_token_here'"
    exit 1
fi

# Build the project
echo "📦 Building project..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
PREVIEW_URL=$(npx vercel --confirm --prebuilt --token "$VERCEL_TOKEN" 2>/dev/null | grep -o 'https://.*\.vercel\.app' | head -1)

if [ -z "$PREVIEW_URL" ]; then
    echo "❌ Error: Could not get preview URL from Vercel"
    exit 1
fi

echo "✅ Preview deployed successfully!"
echo "🌐 Preview URL: $PREVIEW_URL"

# Health check
echo "🔍 Running health check..."
HEALTH_RESPONSE=$(curl -s "$PREVIEW_URL/api/health" 2>/dev/null || echo "{}")
if echo "$HEALTH_RESPONSE" | grep -q '"ok":true'; then
    echo "✅ Health check passed"
else
    echo "⚠️  Health check failed or incomplete"
fi

# Quick page tests
echo "🔍 Testing main pages..."
PAGES=("/" "/needs" "/service-overview" "/auth/register" "/me")
for page in "${PAGES[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PREVIEW_URL$page" 2>/dev/null || echo "000")
    if [ "$STATUS" = "200" ]; then
        echo "✅ $page: $STATUS"
    else
        echo "⚠️  $page: $STATUS"
    fi
done

echo ""
echo "🎉 External Preview Ready!"
echo "📋 Next steps:"
echo "1. Share the preview URL: $PREVIEW_URL"
echo "2. Test the registration flow: $PREVIEW_URL/auth/register"
echo "3. Check the needs listing: $PREVIEW_URL/needs"
echo "4. Verify service overview: $PREVIEW_URL/service-overview"
echo ""
echo "🔧 To promote to production:"
echo "   - Go to Vercel Dashboard → Deployments"
echo "   - Click 'Promote to Production' on this preview"
