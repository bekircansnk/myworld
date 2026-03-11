#!/bin/bash
set -e

echo "🌍 My World - Kurulum Başlatılıyor..."

cd "$(dirname "$0")/.."

# .env oluştur
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ .env dosyası oluşturuldu. Lütfen içerisindeki bilgileri (API KEY vb.) güncelleyin."
fi

# Frontend kurulumu
echo "📦 Frontend bağımlılıkları yükleniyor..."
if [ -d "app/frontend" ]; then
    cd app/frontend
    if [ -f "package.json" ]; then
        npm install
    else
        echo "Frontend henüz oluşturulmamış, bu adım atlanıyor."
    fi
    cd ../..
fi

# Backend kurulumu
echo "🐍 Backend sanal ortamı (venv) oluşturuluyor..."
if [ -d "app/backend" ]; then
    cd app/backend
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    source venv/bin/activate
    
    # Pip güncelleme
    pip install --upgrade pip
    
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
    else
        echo "requirements.txt henüz oluşturulmamış, bu adım atlanıyor."
    fi
    deactivate
    cd ../..
fi

echo "✅ Kurulum tamamlandı!"
echo "Veritabanını başlatmak için: docker-compose up -d"
echo "Uygulamayı başlatmak için: ./scripts/dev.sh"
