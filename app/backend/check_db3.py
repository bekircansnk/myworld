import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://neondb_owner:npg_VH8GNi5XWDda@ep-spring-grass-altw7ldo-pooler.c-3.eu-central-1.aws.neon.tech/neondb?ssl=require"

async def main():
    engine = create_async_engine(DATABASE_URL)
    
    async with engine.begin() as conn:
        # Tasks detaylı
        r = await conn.execute(text("SELECT id, user_id, title, status, project_id FROM tasks ORDER BY id DESC LIMIT 10"))
        print("=== SON 10 GÖREV ===")
        for row in r.fetchall():
            print(f"  id={row[0]}, user_id={row[1]}, project_id={row[3]}, status={row[3]}, title={row[2][:50]}")
        
        # photo_models detaylı
        r2 = await conn.execute(text("SELECT id, user_id, model_name, month, year FROM photo_models ORDER BY id DESC"))
        print("\n=== FOTOĞRAF MODELLERİ ===")
        for row in r2.fetchall():
            print(f"  id={row[0]}, user_id={row[1]}, model={row[2]}, {row[3]}/{row[4]}")
        
        # Venus campaigns
        r3 = await conn.execute(text("SELECT id, user_id, name, status FROM venus_campaigns ORDER BY id DESC"))
        print("\n=== VENUS KAMPANYALARI ===")
        for row in r3.fetchall():
            print(f"  id={row[0]}, user_id={row[1]}, name={row[2]}, status={row[3]}")
        
        # Kullanıcılar
        r4 = await conn.execute(text("SELECT id, email, full_name FROM users"))
        print("\n=== KULLANICILAR ===")
        for row in r4.fetchall():
            print(f"  id={row[0]}, email={row[1]}, name={row[2]}")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
