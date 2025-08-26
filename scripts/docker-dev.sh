#!/bin/bash

# SaaS Factory - Development Docker Environment
set -e

echo "🐳 SaaS Factory - Development Environment"
echo "========================================"

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
    echo "⚠️  .env.local not found. Using default values."
fi

# Build and start services
echo "🔨 Building and starting development containers..."
echo "📊 Resource limits: CPU 15%, Memory 512MB"

# Start only the main app (no database by default)
docker-compose up --build -d saas-factory

echo "🎉 Development environment started!"
echo ""
echo "🌐 Application: http://localhost:3000"
echo "🩺 Health check: http://localhost:3000/api/health"
echo ""
echo "📊 Monitor resource usage:"
echo "   docker stats saas-factory-app"
echo ""
echo "🛑 To stop:"
echo "   docker-compose down"
echo ""
echo "🗃️  To start with local database:"
echo "   docker-compose --profile with-db up --build -d"