#!/bin/bash

# My World - Veritabanı Geri Yükleme (Restore) Scripti
# Bu script yereldeki bir .sql yedeğini Neon PostgreSQL veritabanına geri yükler.

# Scriptin bulunduğu dizini al
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( dirname "$SCRIPT_DIR" )"

# .env dosyasını yükle
if [ -f "$PROJECT_ROOT/.env" ]; then
    export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
else
    echo "Hata: .env dosyası bulunamadı!"
    exit 1
fi

# Yedekleme dosyası kontrolü
if [ -z "$1" ]; then
    echo "Kullanım: $0 <yedek_dosyasi_yolu>"
    echo "Örnek: $0 data/backups/backup_20260314_050000.sql"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Hata: Yedek dosyası bulunamadı: $BACKUP_FILE"
    exit 1
fi

echo "!!! DİKKAT: Bu işlem $DB_HOST üzerindeki $DB_NAME veritabanını TAMAMEN SİLECEK ve yedekten dönecektir."
read -p "Devam etmek istiyor musunuz? (y/n): " confirm

if [ "$confirm" != "y" ]; then
    echo "İşlem iptal edildi."
    exit 0
fi

echo "--- Geri Yükleme Başlatılıyor ---"

# Docker üzerinden psql çalıştır
# Not: Yedeği dosya olarak içeri aktarmak için stdin'e yönlendiriyoruz
cat "$BACKUP_FILE" | docker run --rm -i \
  -e PGPASSWORD="$DB_PASSWORD" \
  postgres:latest \
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"

if [ $? -eq 0 ]; then
    echo "--- Geri Yükleme Başarıyla Tamamlandı ---"
else
    echo "!!! Hata: Geri yükleme başarısız oldu !!!"
    exit 1
fi
