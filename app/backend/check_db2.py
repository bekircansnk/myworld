import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://neondb_owner:npg_VH8GNi5XWDda@ep-spring-grass-altw7ldo-pooler.c-3.eu-central-1.aws.neon.tech/neondb?ssl=require"

async def check_table(conn, table):
    try:
        result = await conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
        return result.scalar()
    except Exception as e:
        return f"HATA: {e}"

async def main():
    engine = create_async_engine(DATABASE_URL)
    
    # Önce tablolara bak
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"))
        tables = [r[0] for r in result.fetchall()]
        print("=== TÜM TABLOLAR ===")
        for t in tables:
            print(f"  {t}")
    
    print("\n=== KAYIT SAYILARI ===")
    for t in tables:
        async with engine.begin() as conn:
            count = await check_table(conn, t)
            print(f"  {t}: {count}")
    
    # Task içerikleri
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT id, title, user_id FROM tasks LIMIT 5"))
        rows = result.fetchall()
        print(f"\n=== İLK 5 GÖREV ===")
        for r in rows:
            print(f"  id={r[0]}, user_id={r[2]}, title={r[1]}")
    
    # Reklam tablosu var mı?
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE '%ad%'"))
        ad_tables = result.fetchall()
        print(f"\n=== REKLAM TABLOLARI ===")
        for r in ad_tables:
            print(f"  {r[0]}")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
