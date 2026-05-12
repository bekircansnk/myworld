"""
task_photos kolonu ekleme migration script'i.
SQLite için ALTER TABLE ile JSON kolonu eklenir.
"""
import sqlite3
import sys
import os

# DB path — backend dizinindeki myworld.db
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "myworld.db")

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"DB bulunamadı: {DB_PATH}")
        sys.exit(1)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Kolon var mı kontrol et
    cursor.execute("PRAGMA table_info(tasks)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if "task_photos" in columns:
        print("task_photos kolonu zaten mevcut, migration atlanıyor.")
        conn.close()
        return
    
    # Kolonu ekle
    cursor.execute("ALTER TABLE tasks ADD COLUMN task_photos TEXT DEFAULT '[]'")
    conn.commit()
    print("✅ task_photos kolonu başarıyla eklendi.")
    conn.close()

if __name__ == "__main__":
    migrate()
