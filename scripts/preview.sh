#!/bin/bash

# NeedPort Platform Preview Deployment Script
# This script builds and deploys the platform to Vercel for preview

set -e

echo "🚀 Starting NeedPort Platform Preview Deployment..."

# Check if VERCEL_TOKEN is set
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Error: VERCEL_TOKEN environment variable is not set"
    echo "Please set VERCEL_TOKEN in your environment or CI/CD secrets"
    exit 1
fi

# Build the project
echo "📦 Building project..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
npx vercel --confirm --prebuilt --token "$VERCEL_TOKEN" 2>/dev/null \
  | awk '/https:\/\/.*\.vercel\.app/ {u=$1} END{if(u) print "Preview:",u; else print "Preview: (not found)"}'

echo "✅ Preview deployment completed!"
