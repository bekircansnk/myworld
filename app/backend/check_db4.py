import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://neondb_owner:npg_VH8GNi5XWDda@ep-spring-grass-altw7ldo-pooler.c-3.eu-central-1.aws.neon.tech/neondb?ssl=require"

async def main():
    engine = create_async_engine(DATABASE_URL)
    
    async with engine.begin() as conn:
        # Tasks sample
        r = await conn.execute(text("SELECT id, user_id, title FROM tasks ORDER BY id DESC LIMIT 5"))
        print("=== SON 5 GÖREV ===")
        for row in r.fetchall():
            print(f"  id={row[0]}, user_id={row[1]}, title={row[2][:60]}")
        
        # photo_models
        r2 = await conn.execute(text("SELECT id, user_id, model_name, month, year FROM photo_models ORDER BY id DESC"))
        print("\n=== FOTOĞRAF MODELLERİ ===")
        for row in r2.fetchall():
            print(f"  id={row[0]}, user_id={row[1]}, model={row[2]}, {row[3]}/{row[4]}")
        
        # Venus campaigns kolonları
        r3 = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='venus_campaigns' ORDER BY ordinal_position"))
        print("\n=== venus_campaigns KOLONLARI ===")
        for row in r3.fetchall():
            print(f"  {row[0]}")
        
        # Venus campaigns all
        r4 = await conn.execute(text("SELECT * FROM venus_campaigns ORDER BY id DESC"))
        print("\n=== VENUS KAMPANYALARI ===")
        for row in r4.fetchall():
            print(f"  {row}")
        
        # Kullanıcılar
        r5 = await conn.execute(text("SELECT id, email FROM users"))
        print("\n=== KULLANICILAR ===")
        for row in r5.fetchall():
            print(f"  id={row[0]}, email={row[1]}")
            
        # Tasks hangi user_id ile en çok
        r6 = await conn.execute(text("SELECT user_id, COUNT(*) FROM tasks GROUP BY user_id"))
        print("\n=== GÖREV DAĞILIMI (USER_ID) ===")
        for row in r6.fetchall():
            print(f"  user_id={row[0]}: {row[1]} görev")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
