from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from typing import AsyncGenerator
import sys
from pathlib import Path

# Alembic'in config'i bulabilmesi için sys.path ekliyoruz
sys.path.append(str(Path(__file__).resolve().parent.parent))
from app.config import settings

engine = create_async_engine(
    settings.database_url,
    echo=True if settings.environment == "development" else False,
    future=True,
    pool_size=5,
    max_overflow=5,
    pool_recycle=300,
    pool_pre_ping=True,
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
