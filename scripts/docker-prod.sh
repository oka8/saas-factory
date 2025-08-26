#!/bin/bash

# SaaS Factory - Production Docker Environment
set -e

echo "🚀 SaaS Factory - Production Environment"
echo "======================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded from .env.local"
else
    echo "❌ .env.local required for production deployment"
    exit 1
fi

# Stop development containers if running
echo "🛑 Stopping any development containers..."
docker-compose down 2>/dev/null || true

# Build production image
echo "🔨 Building production image..."
docker build -t saas-factory:latest .

# Start production container with strict resource limits
echo "🚀 Starting production container..."
echo "📊 Resource limits: CPU 10%, Memory 256MB"

docker run -d \
  --name saas-factory-prod \
  --restart unless-stopped \
  -p 3000:3000 \
  --cpus="0.10" \
  --memory="256m" \
  --health-cmd="wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  --health-start-period=40s \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -e SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY}" \
  -e ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY}" \
  -e NEXT_PUBLIC_APP_URL="http://localhost:3000" \
  -e NEXT_PUBLIC_SITE_NAME="SaaS Factory" \
  saas-factory:latest

echo "🎉 Production environment started!"
echo ""
echo "🌐 Application: http://localhost:3000"
echo "🩺 Health check: http://localhost:3000/api/health"
echo ""
echo "📊 Monitor resource usage:"
echo "   docker stats saas-factory-prod"
echo ""
echo "🛑 To stop:"
echo "   docker stop saas-factory-prod && docker rm saas-factory-prod"