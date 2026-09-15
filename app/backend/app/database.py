from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from typing import AsyncGenerator
import sys
from pathlib import Path

# Alembic'in config'i bulabilmesi için sys.path ekliyoruz
sys.path.append(str(Path(__file__).resolve().parent.parent))
from app.config import settings

connect_args = {}
if settings.environment != "development":
    connect_args["ssl"] = True

engine_kwargs = {
    "echo": True if settings.environment == "development" else False,
    "future": True,
    "pool_recycle": 300,
    "pool_pre_ping": True,
    "connect_args": connect_args,
}

if 'sqlite' not in settings.database_url:
    engine_kwargs.update({
        "pool_size": 10,
        "max_overflow": 20,
        "pool_timeout": 30,
    })

engine = create_async_engine(
    settings.database_url,
    **engine_kwargs
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
