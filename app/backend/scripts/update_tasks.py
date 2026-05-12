import asyncio
import asyncpg
import sys
import os

from dotenv import load_dotenv
load_dotenv('/Users/bekir/Uygulamalarım/2-My-World/.env')

async def update_tasks():
    db_url = os.environ.get('DATABASE_URL')
    # The URL has postgresql+asyncpg://, we need to convert to postgres:// or postgresql://
    db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    try:
        res = await conn.execute("UPDATE tasks SET status = 'in_progress' WHERE status = 'in_review'")
        print(f"Update result: {res}")
    finally:
        await conn.close()

if __name__ == '__main__':
    asyncio.run(update_tasks())
