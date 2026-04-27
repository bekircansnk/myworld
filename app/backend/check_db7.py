import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://neondb_owner:npg_VH8GNi5XWDda@ep-spring-grass-altw7ldo-pooler.c-3.eu-central-1.aws.neon.tech/neondb?ssl=require"

async def main():
    engine = create_async_engine(DATABASE_URL)
    
    async with engine.begin() as conn:
        # is_deleted column type/null check
        r = await conn.execute(text("""
            SELECT id, user_id, project_id, title, is_deleted, status
            FROM tasks 
            WHERE user_id=1 
            ORDER BY id DESC 
            LIMIT 20
        """))
        print("=== BEKİR TÜM GÖREVLERİ (is_deleted dahil) ===")
        for row in r.fetchall():
            print(f"  id={row[0]}, user_id={row[1]}, project_id={row[2]}, is_deleted={row[4]}, status={row[5]}, title={row[3][:50]}")
        
        # Toplam user_id=1 görev
        r2 = await conn.execute(text("SELECT COUNT(*) FROM tasks WHERE user_id=1"))
        print(f"\nToplam user_id=1 görev: {r2.scalar()}")
        
        # is_deleted değerleri dağılımı
        r3 = await conn.execute(text("SELECT is_deleted, COUNT(*) FROM tasks WHERE user_id=1 GROUP BY is_deleted"))
        print("\nis_deleted dağılımı:")
        for row in r3.fetchall():
            print(f"  is_deleted={row[0]}: {row[1]} görev")
        
        # API'nin filter ettiği değer
        r4 = await conn.execute(text("SELECT COUNT(*) FROM tasks WHERE user_id=1 AND (is_deleted IS NULL OR is_deleted = false)"))
        print(f"\nAktif + NULL is_deleted görevler: {r4.scalar()}")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())

# Aynı script'e ek
async def check_calendar():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        r = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='calendar_events'"))
        cols = [row[0] for row in r.fetchall()]
        print(f"\ncalendar_events kolonları: {cols}")
        
        r2 = await conn.execute(text("SELECT COUNT(*) FROM calendar_events WHERE user_id=1"))
        print(f"Bekir takvim etkinlikleri: {r2.scalar()}")
    await engine.dispose()

import asyncio
asyncio.run(check_calendar())

async def check_cal2():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        r = await conn.execute(text("SELECT is_deleted, COUNT(*) FROM calendar_events WHERE user_id=1 GROUP BY is_deleted"))
        print("\n=== TAKVİM ETKİNLİKLERİ is_deleted dağılımı ===")
        for row in r.fetchall():
            print(f"  is_deleted={row[0]}: {row[1]}")
        
        r2 = await conn.execute(text("SELECT id, title, is_deleted FROM calendar_events WHERE user_id=1 LIMIT 10"))
        for row in r2.fetchall():
            print(f"  id={row[0]}, title={row[1]}, is_deleted={row[2]}")
    await engine.dispose()

asyncio.run(check_cal2())
