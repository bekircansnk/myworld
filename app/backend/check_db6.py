import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://neondb_owner:npg_VH8GNi5XWDda@ep-spring-grass-altw7ldo-pooler.c-3.eu-central-1.aws.neon.tech/neondb?ssl=require"

async def main():
    engine = create_async_engine(DATABASE_URL)
    
    async with engine.begin() as conn:
        # Bekir'in (user_id=1) tüm verileri
        r = await conn.execute(text("SELECT id, name, color, is_active FROM projects WHERE user_id=1 ORDER BY id"))
        print("=== BEKİR PROJELERİ ===")
        for row in r.fetchall():
            print(f"  id={row[0]}, name={row[1]}, is_active={row[3]}")
        
        r2 = await conn.execute(text("SELECT COUNT(*) FROM tasks WHERE user_id=1 AND is_deleted=false"))
        print(f"\n=== BEKİR AKTİF GÖREVLERİ: {r2.scalar()} ===")
        
        r3 = await conn.execute(text("SELECT COUNT(*) FROM tasks WHERE user_id=1 AND is_deleted=true"))
        print(f"=== BEKİR SİLİNMİŞ GÖREVLERİ: {r3.scalar()} ===")
        
        r4 = await conn.execute(text("SELECT id, title, is_deleted FROM tasks WHERE user_id=1 ORDER BY id DESC LIMIT 10"))
        print("\n=== BEKİR SON 10 GÖREVİ ===")
        for row in r4.fetchall():
            print(f"  id={row[0]}, is_deleted={row[2]}, title={row[1][:60]}")
        
        r5 = await conn.execute(text("SELECT id, model_name, month, year, status FROM photo_models WHERE user_id=1 ORDER BY id DESC"))
        print("\n=== BEKİR FOTOĞRAF MODELLERİ ===")
        for row in r5.fetchall():
            print(f"  id={row[0]}, model={row[1]}, {row[2]}/{row[3]}, status={row[4]}")
        
        r6 = await conn.execute(text("SELECT id, campaign_name, status FROM venus_campaigns WHERE user_id=1 ORDER BY id DESC"))
        print("\n=== BEKİR VENUS KAMPANYALARI ===")
        for row in r6.fetchall():
            print(f"  id={row[0]}, kampanya={row[1]}, status={row[2]}")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
