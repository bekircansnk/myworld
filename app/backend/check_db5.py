import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://neondb_owner:npg_VH8GNi5XWDda@ep-spring-grass-altw7ldo-pooler.c-3.eu-central-1.aws.neon.tech/neondb?ssl=require"

async def get_columns(conn, table):
    r = await conn.execute(text(f"SELECT column_name FROM information_schema.columns WHERE table_name='{table}' ORDER BY ordinal_position"))
    return [row[0] for row in r.fetchall()]

async def main():
    engine = create_async_engine(DATABASE_URL)
    
    async with engine.begin() as conn:
        # Tüm tablolar
        tables_to_check = ['users', 'tasks', 'photo_models', 'venus_campaigns', 'projects']
        for t in tables_to_check:
            cols = await get_columns(conn, t)
            print(f"\n=== {t.upper()} KOLONLARI ===")
            print(f"  {', '.join(cols)}")
    
    async with engine.begin() as conn:
        # Tasks count by project
        r = await conn.execute(text("SELECT project_id, COUNT(*) FROM tasks GROUP BY project_id ORDER BY COUNT(*) DESC LIMIT 10"))
        print("\n=== GÖREV PROJEYİ DAĞILIMI ===")
        for row in r.fetchall():
            print(f"  project_id={row[0]}: {row[1]} görev")
    
    async with engine.begin() as conn:
        # Auth / user tablosu kolonları
        r = await conn.execute(text("SELECT * FROM users LIMIT 3"))
        cols = r.keys()
        print(f"\n=== USERS TABLE - KOLON ADLARI ===")
        print(list(cols))
        for row in r.fetchall():
            print(f"  {row}")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
