#!/bin/bash
echo "🌍 My World - Geliştirme Ortamı Başlatılıyor..."

cd "$(dirname "$0")/.."
PROJECT_ROOT=$PWD

echo "🐳 Docker servisleri (DB & Redis) başlatılıyor..."
docker-compose up -d

echo "🐍 Backend başlatılıyor (Yeni terminal penceresinde)..."
osascript -e 'tell app "Terminal" to do script "cd \"'"$PROJECT_ROOT"'/app/backend\" && source venv/bin/activate && uvicorn app.main:app --reload"'

echo "💻 Frontend başlatılıyor (Yeni terminal penceresinde)..."
if [ -d "app/frontend" ] && [ -f "app/frontend/package.json" ]; then
    osascript -e 'tell app "Terminal" to do script "cd \"'"$PROJECT_ROOT"'/app/frontend\" && npm run dev"'
else
    echo "Frontend kurulu değil, bu adım atlandı."
fi

echo "✅ Geliştirme ortamı ayağa kalkıyor."
echo "API Dokümantasyonu: http://localhost:8000/docs"
echo "Frontend URL: http://localhost:3000"
