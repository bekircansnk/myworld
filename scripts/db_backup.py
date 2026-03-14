import asyncio
import os
import json
import datetime
from pathlib import Path
from dotenv import load_dotenv
import asyncpg

# Proje kök dizinini bul
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
# SQLAlchemy formatındaki URL'yi asyncpg formatına (veya doğrudan stringe) dönüştür
# postgresql+asyncpg://... -> postgresql://...
if DATABASE_URL and "+asyncpg" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("+asyncpg", "")

BACKUP_ROOT = BASE_DIR / "data" / "backups"
TIMESTAMP = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
BACKUP_DIR = BACKUP_ROOT / f"json_backup_{TIMESTAMP}"

async def backup_table(conn, table_name, backup_path):
    print(f"  - {table_name} yedekleniyor...")
    rows = await conn.fetch(f'SELECT * FROM "{table_name}"')
    
    # Verileri serileştirilebilir hale getir (datetime vb. objeleri stringe çevir)
    data = []
    for row in rows:
        item = dict(row)
        for key, value in item.items():
            if isinstance(value, (datetime.datetime, datetime.date)):
                item[key] = value.isoformat()
            elif isinstance(value, bytes):
                import base64
                item[key] = base64.b64encode(value).decode('utf-8')
        data.append(item)
        
    with open(backup_path / f"{table_name}.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

async def main():
    if not DATABASE_URL:
        print("Hata: DATABASE_URL .env dosyasında bulunamadı!")
        return

    print(f"--- Python Yedekleme Başlatılıyor ({TIMESTAMP}) ---")
    
    try:
        conn = await asyncpg.connect(DATABASE_URL)
    except Exception as e:
        print(f"Hata: Veritabanına bağlanılamadı: {e}")
        return

    # Şema altındaki tüm tabloları al (public şeması)
    tables = await conn.fetch("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    """)

    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    
    for table in tables:
        table_name = table['table_name']
        # Alembic tablolarını yedekleme (opsiyonel)
        if table_name == 'alembic_version':
            continue
        await backup_table(conn, table_name, BACKUP_DIR)

    await conn.close()
    print(f"--- Yedekleme Tamamlandı ---")
    print(f"Konum: {BACKUP_DIR}")

    # Zip oluştur (Opsiyonel ama önerilir)
    import shutil
    shutil.make_archive(str(BACKUP_DIR), 'zip', str(BACKUP_DIR))
    print(f"Arşiv oluşturuldu: {BACKUP_DIR}.zip")
    
    # Geçici klasörü sil
    shutil.rmtree(BACKUP_DIR)

if __name__ == "__main__":
    asyncio.run(main())
