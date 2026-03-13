#!/bin/bash
# ============================================
# 🛑 My World - Sistemi Durdur
# Çift tıkla ve tüm sistem kapansın!
# ============================================

cd "$(dirname "$0")"

clear
echo ""
echo "  🌍  ╔══════════════════════════════════════╗"
echo "      ║     MY WORLD - SİSTEM DURDURULUYOR   ║"
echo "      ╚══════════════════════════════════════╝"
echo ""

# 1) Frontend durdur
echo "  💻  Frontend durduruluyor (port 3000)..."
FRONTEND_PIDS=$(lsof -i :3000 -t 2>/dev/null)
if [ -n "$FRONTEND_PIDS" ]; then
    echo "$FRONTEND_PIDS" | xargs kill -9 2>/dev/null
    echo "  ✅  Frontend durduruldu"
else
    echo "  ℹ️  Frontend zaten kapalı"
fi

# 2) Backend durdur
echo "  🐍  Backend durduruluyor (port 8000)..."
BACKEND_PIDS=$(lsof -i :8000 -t 2>/dev/null)
if [ -n "$BACKEND_PIDS" ]; then
    echo "$BACKEND_PIDS" | xargs kill -9 2>/dev/null
    echo "  ✅  Backend durduruldu"
else
    echo "  ℹ️  Backend zaten kapalı"
fi

# 3) Docker durdur
echo "  🐳  Docker servisleri durduruluyor..."
docker-compose down 2>/dev/null
if [ $? -eq 0 ]; then
    echo "  ✅  Docker durduruldu (PostgreSQL + Redis)"
else
    echo "  ℹ️  Docker zaten kapalı veya hata oluştu"
fi

echo ""
echo "  🛑  ╔══════════════════════════════════════╗"
echo "      ║     SİSTEM DURDURULDU! 🔴             ║"
echo "      ╚══════════════════════════════════════╝"
echo ""
echo "  💡 Yeniden başlatmak için '🚀 Sistemi Başlat' dosyasına çift tıklayın."
echo ""
