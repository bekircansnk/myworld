#!/bin/bash

# My World - Veritabanı Yedekleme Scripti (Python-JSON Versiyonu)
# Bu script pg_dump bağımlılığı olmadan verileri JSON olarak yedekler.

# Scriptin bulunduğu dizini al
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( dirname "$SCRIPT_DIR" )"

echo "--- Yedekleme Başlatılıyor (Python JSON) ---"

# Sanal ortamı kontrol et ve aktif et
if [ -d "$PROJECT_ROOT/app/backend/venv" ]; then
    source "$PROJECT_ROOT/app/backend/venv/bin/activate"
else
    echo "Hata: Python sanal ortamı (venv) bulunamadı! Lütfen ./scripts/setup.sh çalıştırın."
    exit 1
fi

# Python scriptini çalıştır
python3 "$SCRIPT_DIR/db_backup.py"

if [ $? -eq 0 ]; then
    echo "--- İşlem Başarıyla Tamamlandı ---"
else
    echo "!!! Hata: Yedekleme sırasında bir sorun oluştu !!!"
    exit 1
fi

deactivate
