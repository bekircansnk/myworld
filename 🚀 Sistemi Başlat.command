#!/bin/bash
# ============================================
# 🚀 My World - Sistemi Başlat
# Çift tıkla ve tüm sistem ayağa kalksın!
# ============================================

cd "$(dirname "$0")"
PROJECT_ROOT=$PWD

clear
echo ""
echo "  🌍  ╔══════════════════════════════════════╗"
echo "      ║     MY WORLD - SİSTEM BAŞLATILIYOR   ║"
echo "      ╚══════════════════════════════════════╝"
echo ""

# 1) Eski süreçleri temizle
echo "  🧹  Eski süreçler kontrol ediliyor..."
lsof -i :3000 -t | xargs kill -9 2>/dev/null
lsof -i :8000 -t | xargs kill -9 2>/dev/null
sleep 1

# 2) Docker (DB & Redis)
echo "  🐳  Docker servisleri başlatılıyor..."
docker-compose up -d 2>/dev/null
if [ $? -eq 0 ]; then
    echo "  ✅  Docker hazır (PostgreSQL + Redis)"
else
    echo "  ⚠️  Docker başlatılamadı. Docker Desktop açık mı?"
fi
sleep 2

# 3) Backend
echo "  🐍  Backend başlatılıyor..."
osascript -e 'tell app "Terminal" to do script "cd \"'"$PROJECT_ROOT"'/app/backend\" && source venv/bin/activate && uvicorn app.main:app --reload --port 8000"' 2>/dev/null
echo "  ✅  Backend → http://localhost:8000"

# 4) Frontend
echo "  💻  Frontend başlatılıyor..."
if [ -d "app/frontend" ] && [ -f "app/frontend/package.json" ]; then
    osascript -e 'tell app "Terminal" to do script "cd \"'"$PROJECT_ROOT"'/app/frontend\" && npm run dev"' 2>/dev/null
    echo "  ✅  Frontend → http://localhost:3000"
else
    echo "  ⚠️  Frontend kurulu değil, atlandı."
fi

sleep 3

echo ""
echo "  🎉  ╔══════════════════════════════════════╗"
echo "      ║     SİSTEM HAZIR! ÇALIŞIYOR! 🟢      ║"
echo "      ╠══════════════════════════════════════╣"
echo "      ║  🌐 Frontend: http://localhost:3000  ║"
echo "      ║  📡 Backend:  http://localhost:8000  ║"
echo "      ║  📚 API Docs: http://localhost:8000/docs ║"
echo "      ╚══════════════════════════════════════╝"
echo ""
echo "  💡 Bu pencereyi kapatabilirsiniz."
echo ""

# Tarayıcıda otomatik aç
sleep 2
open "http://localhost:3000" 2>/dev/null
