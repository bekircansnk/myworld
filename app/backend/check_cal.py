import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://neondb_owner:npg_VH8GNi5XWDda@ep-spring-grass-altw7ldo-pooler.c-3.eu-central-1.aws.neon.tech/neondb?ssl=require"

async def main():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        r = await conn.execute(text("SELECT COUNT(*), user_id FROM calendar_events GROUP BY user_id"))
        print("=== TAKVİM ETKİNLİKLERİ tüm kullanıcılar ===")
        for row in r.fetchall():
            print(f"  user_id={row[1]}: {row[0]} etkinlik")
        
        r2 = await conn.execute(text("SELECT * FROM calendar_events LIMIT 5"))
        print("\n=== İLK 5 TAKVİM ETKİNLİĞİ ===")
        cols = r2.keys()
        print(list(cols))
        for row in r2.fetchall():
            print(f"  {row}")
    await engine.dispose()

asyncio.run(main())
