import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://neondb_owner:npg_VH8GNi5XWDda@ep-spring-grass-altw7ldo-pooler.c-3.eu-central-1.aws.neon.tech/neondb?ssl=require"

async def main():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        tables = ['users', 'tasks', 'photo_models', 'photo_model_colors', 'photo_revisions', 'ads', 'projects']
        for t in tables:
            try:
                result = await conn.execute(text(f"SELECT COUNT(*) FROM {t}"))
                count = result.scalar()
                print(f"  {t}: {count} kayıt")
            except Exception as e:
                print(f"  {t}: HATA - {e}")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
